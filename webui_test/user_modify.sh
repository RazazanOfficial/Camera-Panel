#!/bin/sh

source ./json.sh
response_body=""
response_status="200 OK"
USERS_FILE="/etc/webUsers"

CURRENT_USER_LEVEL=1

get_level_name() {
    case "$1" in
        0) echo "guest" ;;
        1) echo "admin" ;;
        2) echo "superadmin" ;;
        *) echo "unknown" ;;
    esac
}

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -z "$POST_number_line" ] || [ -z "$POST_username" ] || [ -z "$POST_password" ] || [ -z "$POST_level" ]; then
        add_json_value "\"error\": \"number_line, username, password and level are required\""
        response_status="400 Bad Request"
    else
        user_line=$(sed -n "${POST_number_line}p" "$USERS_FILE")

        if [ -z "$user_line" ]; then
            add_json_value "\"error\": \"line not found\""
            response_status="404 Not Found"
        else
            current_level=$(echo "$user_line" | awk -F: '{print $4}')

            if [ "$current_level" -gt "$CURRENT_USER_LEVEL" ]; then
                add_json_value "\"error\": \"insufficient privileges to modify this user\""
                response_status="403 Forbidden"
            elif [ "$POST_level" -gt "$CURRENT_USER_LEVEL" ]; then
                add_json_value "\"error\": \"cannot assign higher level than your own\""
                response_status="403 Forbidden"
            else
                password_b64=$(echo -n "$POST_password" | base64)
                new_line="$POST_username:$password_b64:$(get_level_name $POST_level):$POST_level"

                sed -i "${POST_number_line}s/.*/$new_line/" "$USERS_FILE"

                add_json_value "\"modified\": \"$POST_username\""
                add_json_value "\"level\": \"$(get_level_name $POST_level)\""
            fi
        fi
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"

