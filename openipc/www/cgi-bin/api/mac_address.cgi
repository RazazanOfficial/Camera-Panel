#!/usr/bin/haserl

<%
response_status="200 OK"

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""

if [ "$REQUEST_METHOD" = "GET" ]; then
    mac=$(cat /sys/class/net/eth0/address 2>/dev/null)
    echo "{ \"mac_address\": \"${mac:-unknown}\" }"
else
    echo "{ \"error\": \"Unsupported method\" }"
fi
%>
