#!/usr/bin/haserl
<%

source ./json.sh
response_body=""
response_status="200 OK"
TIMEZONE_FILE="./timezone.txt"

get_timezone_full() {
    if [ -f /etc/timezone ]; then
        cat /etc/timezone
    else
        echo "Unknown"
    fi
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    timezone=$(get_timezone_full)
    add_json_value "\"timezone\": \"$timezone\""
fi


if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_timezone" ]; then
	line=$(grep -E "^$POST_timezone[[:space:]]" "$TIMEZONE_FILE")
        if [ -n "$line" ]; then
            tz_name=$(echo "$line" | awk '{print $1}')
            tz_offset=$(echo "$line" | awk '{print $2}')

	    echo "$tz_name" > /etc/timezone
            echo "$tz_offset" > /etc/TZ


            add_json_value "\"timezone\": \"$tz_name\""
            reboot &

        else
            add_json_value "\"error\": \"Invalid timezone name\""
            response_status="400 Bad Request"
        fi
    else
        add_json_value "\"error\": \"timezone not provided\""
        response_status="400 Bad Request"
    fi
fi


echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
