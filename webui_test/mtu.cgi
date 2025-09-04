#!/usr/bin/haserl
<%
source ./json.sh
response_body=""
response_status="200 OK"

NET_IFACE="eth0"

get_mtu() {
    cat /sys/class/net/$NET_IFACE/mtu 2>/dev/null
}

set_mtu() {
    ip link set dev $NET_IFACE mtu "$1" 2>/dev/null
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    mtu=$(get_mtu)
    if [ -n "$mtu" ]; then
        add_json_value "\"mtu\": \"$mtu\""
    else
        add_json_value "\"error\": \"Cannot read MTU\""
        response_status="500 Internal Server Error"
    fi
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_mtu" ]; then
        if echo "$POST_mtu" | grep -Eq '^[0-9]+$'; then
            set_mtu "$POST_mtu"
            if [ $? -eq 0 ]; then
                add_json_value "\"mtu\": \"$POST_mtu\""
            else
                add_json_value "\"error\": \"Failed to set MTU\""
                response_status="500 Internal Server Error"
            fi
        else
            add_json_value "\"error\": \"Invalid MTU value\""
            response_status="400 Bad Request"
        fi
    else
        add_json_value "\"error\": \"mtu not provided\""
        response_status="400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
