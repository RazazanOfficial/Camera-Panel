#!/usr/bin/haserl
<%
source ./json.sh
response_body=" "
response_status=" 200 OK"

ETH0_CONF="/etc/network/interfaces.d/eth0"
IFACE="eth0"

get_current_mode() {
    grep -q "iface $IFACE inet dhcp" "$ETH0_CONF" && echo "true" || echo "false"
}

get_ip_addr() {
    grep "^[[:space:]]*address" "$ETH0_CONF" | awk '{print $2}'
}

get_netmask() {
    grep "^[[:space:]]*netmask" "$ETH0_CONF" | awk '{print $2}'
}

get_gateway() {
    grep "^[[:space:]]*gateway" "$ETH0_CONF" | awk '{print $2}'
}

apply_network() {
    /etc/init.d/S40network restart >/dev/null 2>&1
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    current_dhcp=$(get_current_mode)
    ip_addr=$(get_ip_addr)
    netmask=$(get_netmask)
    gateway=$(get_gateway)

    add_json_value "\"dhcp\": \"$current_dhcp\""
    add_json_value "\"ipv4_address\": \"${ip_addr:-Not Configured}\""
    add_json_value "\"ipv4_netmask\": \"${netmask:-Not Configured}\""
    add_json_value "\"ipv4_gateway\": \"${gateway:-Not Configured}\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_dhcp" ]; then
        if [ "$POST_dhcp" = "true" ]; then
            cat > "$ETH0_CONF" <<EOF
iface $IFACE inet dhcp
    hwaddress ether \$(fw_printenv -n ethaddr || echo 00:00:23:34:45:66)
EOF
            add_json_value "\"dhcp\": \"true\""
            add_json_value "\"note\": \"Static options ignored because dhcp=true\""
            apply_network

        elif [ "$POST_dhcp" = "false" ]; then
            if [ -z "$POST_ipv4_address" ] || [ -z "$POST_ipv4_netmask" ] || [ -z "$POST_ipv4_gateway" ]; then
                add_json_value "\"error\": \"ipv4_address, ipv4_netmask, ipv4_gateway must be provided when dhcp=false\""
                response_status=" 400 Bad Request"
            else
                cat > "$ETH0_CONF" <<EOF
iface $IFACE inet static
    hwaddress ether \$(fw_printenv -n ethaddr || echo 00:00:23:34:45:66)
    address $POST_ipv4_address
    netmask $POST_ipv4_netmask
    gateway $POST_ipv4_gateway
    pre-up echo nameserver $POST_ipv4_gateway > /tmp/resolv.conf
EOF
                add_json_value "\"dhcp\": \"false\""
                add_json_value "\"ipv4_address\": \"$POST_ipv4_address\""
                add_json_value "\"ipv4_netmask\": \"$POST_ipv4_netmask\""
                add_json_value "\"ipv4_gateway\": \"$POST_ipv4_gateway\""
                apply_network
            fi
        else
            add_json_value "\"error\": \"Invalid value for dhcp (must be true or false)\""
            response_status=" 400 Bad Request"
        fi
    else
        add_json_value "\"error\": \"dhcp not provided\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
