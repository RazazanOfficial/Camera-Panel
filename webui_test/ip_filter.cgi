#!/usr/bin/haserl
<%
source ./json.sh

FIREWALL_FILE="/mnt/data/firewallsettings.tsv"

response_status="200 OK"
response_body=""

update_ip_status() {
    ip="$1"
    status="$2"

    if [ ! -f "$FIREWALL_FILE" ]; then
        echo -e "ip\tstatus" > "$FIREWALL_FILE"
    fi

    grep -v "^$ip\t" "$FIREWALL_FILE" > "$FIREWALL_FILE.tmp"

    echo -e "$ip\t$status" >> "$FIREWALL_FILE.tmp"

    mv "$FIREWALL_FILE.tmp" "$FIREWALL_FILE"
}

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_ip_filter" ] && [ -n "$POST_status" ]; then
        IP="$POST_ip_filter"
        STATUS="$POST_status"

        case "$STATUS" in
            allowed|forbidden)
                update_ip_status "$IP" "$STATUS"
                add_json_value "\"status\": \"success\""
                add_json_value "\"ip\": \"$IP\""
                add_json_value "\"set_to\": \"$STATUS\""
                ;;
            *)
                add_json_value "\"status\": \"error\""
                add_json_value "\"message\": \"Invalid status (must be allowed or forbidden)\""
                response_status="400 Bad Request"
                ;;
        esac
    else
        add_json_value "\"status\": \"error\""
        add_json_value "\"message\": \"POST_ip_filter or POST_status not provided\""
        response_status="400 Bad Request"
    fi

elif [ "$REQUEST_METHOD" = "GET" ]; then
    if [ -f "$FIREWALL_FILE" ]; then
        json_array="["
        first_item=true
        {
            read
            while IFS=$'\t' read -r ip status; do
                [ -z "$ip" ] && continue
                if [ "$first_item" = true ]; then
                    json_array="$json_array{\"ip\":\"$ip\",\"status\":\"$status\"}"
                    first_item=false
                else
                    json_array="$json_array,{\"ip\":\"$ip\",\"status\":\"$status\"}"
                fi
            done
        } < "$FIREWALL_FILE"
        json_array="$json_array]"
        add_json_value "\"ip_list\": $json_array"
    else
        add_json_value "\"ip_list\": []"
    fi
else
    add_json_value "\"status\": \"error\""
    add_json_value "\"message\": \"Unsupported method\""
    response_status="405 Method Not Allowed"
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
