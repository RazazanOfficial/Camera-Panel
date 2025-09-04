#!/usr/bin/haserl
<%
source ./json.sh
response_body=""
response_status="200 OK"
USERS_FILE="/etc/webUsers"

CURRENT_USER_LEVEL=1

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -z "$POST_number_line" ]; then
        add_json_value "\"error\": \"number_line is required\""
        response_status="400 Bad Request"
    else
        user_line=$(sed -n "${POST_number_line}p" "$USERS_FILE")

        if [ -z "$user_line" ]; then
            add_json_value "\"error\": \"line not found\""
            response_status="404 Not Found"
        else
            username=$(echo "$user_line" | awk -F: '{print $1}')
            level_num=$(echo "$user_line" | awk -F: '{print $4}')

            if [ "$level_num" -gt "$CURRENT_USER_LEVEL" ]; then
                add_json_value "\"error\": \"insufficient privileges to delete this user\""
                response_status="403 Forbidden"
            else
                sed -i "${POST_number_line}d" "$USERS_FILE"
                add_json_value "\"deleted\": \"$username\""
            fi
        fi
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
