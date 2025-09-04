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

if [ "$REQUEST_METHOD" = "GET" ]; then
    users_json=""

    if [ -f "$USERS_FILE" ]; then
        while IFS=: read -r username password level_name level_num; do
            level_human=$(get_level_name "$level_num")

            user_entry="{\"username\": \"$username\", \"level\": \"$level_human\"}"

            if [ -z "$users_json" ]; then
                users_json="$user_entry"
            else
                users_json="$users_json, $user_entry"
            fi
        done < "$USERS_FILE"
    fi

    add_json_value "\"users\": [ $users_json ]"
fi


if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -z "$POST_username" ] || [ -z "$POST_password" ] || [ -z "$POST_level" ]; then
        add_json_value "\"error\": \"username, password and level are required\""
        response_status="400 Bad Request"
    else
        if grep -q "^$POST_username:" "$USERS_FILE"; then
            add_json_value "\"error\": \"username already exists\""
            response_status="400 Bad Request"
        else
            if [ "$POST_level" -gt "$CURRENT_USER_LEVEL" ]; then
                add_json_value "\"error\": \"insufficient privileges to create higher level user\""
                response_status="403 Forbidden"
            else
                password_b64=$(echo -n "$POST_password" | base64)

                if [ -s "$USERS_FILE" ]; then
                    last_id=$(awk -F: '{print $4}' "$USERS_FILE" | sort -n | tail -1)
                    new_id=$((last_id+1))
                else
                    new_id=1
                fi

                echo "$POST_username:$password_b64:$(get_level_name $POST_level):$POST_level" >> "$USERS_FILE"

                add_json_value "\"username\": \"$POST_username\""
                add_json_value "\"level\": \"$(get_level_name $POST_level)\""
            fi
        fi
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
