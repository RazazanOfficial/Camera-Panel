#!/bin/sh

source ./json.sh
response_body=""
response_status="200 OK"

if [ "$REQUEST_METHOD" = "POST" ]; then
    (sleep 4 && reboot) &
else
    response_body='{"error": "Something wrong... please try again later."}'
    response_status="500 Internal Server Error"
fi

echo "status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"

