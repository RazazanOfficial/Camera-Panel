#!/bin/sh

source ./json.sh
response_body=" "
response_status=" 200 OK"

DNS_FILE="/tmp/resolv.conf"

get_dns_servers() {
    grep "^nameserver" "$DNS_FILE" 2>/dev/null | awk '{print $2}'
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    dns_list=$(get_dns_servers)

    preferred=$(echo "$dns_list" | sed -n '1p')
    alternate=$(echo "$dns_list" | sed -n '2p')

    add_json_value "\"preferred_dns\": \"${preferred:-Not Configured}\""
    add_json_value "\"alternate_dns\": \"${alternate:-Not Configured}\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_preferred_dns" ] || [ -n "$POST_alternate_dns" ]; then
        : > "$DNS_FILE"
        if [ -n "$POST_preferred_dns" ]; then
            echo "nameserver $POST_preferred_dns" >> "$DNS_FILE"
        fi
        if [ -n "$POST_alternate_dns" ]; then
            echo "nameserver $POST_alternate_dns" >> "$DNS_FILE"
        fi

        add_json_value "\"preferred_dns\": \"${POST_preferred_dns:-Not Set}\""
        add_json_value "\"alternate_dns\": \"${POST_alternate_dns:-Not Set}\""
    else
        add_json_value "\"error\": \"No DNS servers provided\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
