#!/usr/bin/haserl
<%
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
                OLD_LINE=$(sed -n "${REAL_LINE}p" "$FIREWALL_FILE")
                OLD_IP=$(echo "$OLD_LINE" | awk '{print $1}')
                OLD_STATUS=$(echo "$OLD_LINE" | awk '{print $2}')

                NEW_IP=${POST_ip:-$OLD_IP}
                NEW_STATUS=${POST_status:-$OLD_STATUS}

                case "$NEW_STATUS" in
                    allowed|forbidden)
                        sed -i "${REAL_LINE}s/.*/${NEW_IP}\t${NEW_STATUS}/" "$FIREWALL_FILE"
                        add_json_value "\"status\": \"success\""
                        add_json_value "\"modified_line\": \"$LINE\""
                        add_json_value "\"old_ip\": \"$OLD_IP\""
                        add_json_value "\"old_status\": \"$OLD_STATUS\""
                        add_json_value "\"new_ip\": \"$NEW_IP\""
                        add_json_value "\"new_status\": \"$NEW_STATUS\""
                        ;;
                    *)
                        add_json_value "\"status\": \"error\""
                        add_json_value "\"message\": \"Invalid status (must be allowed or forbidden)\""
                        response_status="400 Bad Request"
                        ;;
                esac
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
%>
