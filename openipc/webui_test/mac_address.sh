#!/bin/sh

response_body=""
response_status="200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
	mac=$(cat /sys/class/net/eth0/address 2>/dev/null)
        echo "{ \"mac_address\": \"${mac:-unknown}\" }"
else
	echo "{ \"error\": \"Unsupported method\" }"
fi	


echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
