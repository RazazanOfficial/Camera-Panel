#!/usr/bin/haserl
<%

source /var/www/cgi-bin/api/json.sh

response_body=" "
response_status=" 200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
    localTime=$(date +"%Y-%m-%d %H:%M:%S")
    add_json_value "\"local_time\": \"$localTime\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_local_time" ]; then
        if date -s "$POST_local_time" >/dev/null 2>&1; then
            localTime=$(date +"%Y-%m-%d %H:%M:%S")
            add_json_value "\"local_time\": \"$localTime\""
        else
            add_json_value "\"error\": \"Invalid time format\""
            response_status=" 400 Bad Request"
        fi
    else
        add_json_value "\"error\": \"time not provided\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"

%>

