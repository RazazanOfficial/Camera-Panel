#!/bin/sh

FIREWALL_FILE="/mnt/data/firewallsettings.tsv"
response_status="200 OK"
response_body=""

source ./json.sh

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_line_number" ]; then
        LINE="$POST_line_number"

        if [ ! -f "$FIREWALL_FILE" ]; then
            add_json_value "\"status\": \"error\""
            add_json_value "\"message\": \"Firewall settings file not found\""
            response_status="404 Not Found"
        else
            TOTAL_LINES=$(wc -l < "$FIREWALL_FILE")
            DATA_LINES=$((TOTAL_LINES - 1))

            if [ "$LINE" -lt 1 ] || [ "$LINE" -gt "$DATA_LINES" ]; then
                add_json_value "\"status\": \"error\""
                add_json_value "\"message\": \"Invalid line number (0 is header, 1..$DATA_LINES are IPs)\""
                response_status="400 Bad Request"
            else
                REAL_LINE=$((LINE + 1))
                sed -i "${REAL_LINE}d" "$FIREWALL_FILE"
                add_json_value "\"status\": \"success\""
                add_json_value "\"deleted_line\": \"$LINE\""
            fi
        fi
    else
        add_json_value "\"status\": \"error\""
        add_json_value "\"message\": \"POST_line_number not provided\""
        response_status="400 Bad Request"
    fi
else
    add_json_value "\"status\": \"error\""
    add_json_value "\"message\": \"Unsupported method (use POST)\""
    response_status="405 Method Not Allowed"
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
