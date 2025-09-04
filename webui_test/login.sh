#!/bin/sh


make_users_file() {
    echo "$default_users" > "$users_file"
}

check_users_file() {
    if [ ! -f "$users_file" ]; then
        make_users_file
    fi
}

get_user_info() {
    line=$(grep -m1 "^$GET_user:" "$users_file")
    if [ -z "$line" ]; then
        #echo "User '$GET_user' not found"
        return 1
    fi
    user_name="${line%%:*}"
    local rest="${line#*:}"
    user_password="${rest%%:*}"
    rest="${rest#*:}"
    user_group="${rest%%:*}"
    rest="${rest#*:}"
    user_level="${rest%%:*}"

    user_password=$(echo "$user_password" | base64 -d)
    return 0
}

make_random_num() {
    random_value=$(od -An -N4 -tu4 /dev/urandom | tr -d ' ')
}

make_credit_hash() {
    local input="$user_name:$random_value:$user_password"
    user_hash=$(echo -n "$input" | md5sum | awk '{print $1}')
}

insert_credit_hash() {
    #make a line and add it to end of file if line in file is not more than maximum
    local fifo_file="$temp_logins"
    local max_lines=$max_logins
    local timeout=$timout_logins  # seconds
    local new_data="$user_name:$user_hash:$user_level"  # Input text (without timestamp)
    local now=$(date +%s)

    # Ensure file exists
    touch "$fifo_file"

    # Get the first (oldest) line
    local first_line=$(head -n 1 "$fifo_file")

    # Extract the timestamp (first field before ':')
    local first_time=$(echo "$first_line" | cut -d':' -f1)

    # If file is empty, or timeout has passed → allow insert
    if [ -z "$first_time" ] || [ $((now - first_time)) -ge "$timeout" ]; then
      # Add new line with current epoch timestamp
      echo "$now:$new_data" >> "$fifo_file"

      # Keep only the last $max_lines lines
      tail -n "$max_lines" "$fifo_file" > "${fifo_file}.tmp" && mv "${fifo_file}.tmp" "$fifo_file"

      return 0  # success
    else
#      echo "new login insert error"
      return 1  # failure
    fi
}

login_end() {
    echo "Status: $response_status"
    echo "Content-Type: application/json"
    echo ""

# Output JSON error message
    echo "$response_body"
    exit 0
}

default_users="admin:YWRtaW4=:user:1"$'\n'"shahaab:c2hhaGFhYl9jbw==:admin:2"
users_file="/etc/webUsers"
temp_logins="/tmp/webui/tempLogins"
max_logins=4    #in lines
timout_logins=4 #in seconds
response_body=""
response_status=" 200 OK"

[ ! -d /tmp/webui ] && mkdir -p /tmp/webui

check_users_file

#now get users name from input variable
if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -z "$GET_user" ]; then
        response_body="{\"error\":\"need user name  in url like user=admin\"}"
        response_status=" 404 Not Found"
        login_end
    fi
    #then call function to set variable from /etc/
    get_user_info
    if [ $? != 0 ]; then
        response_body="{\"error\":\"user info not available in system\"}"
        response_status=" 404 Not Found"
	login_end
    fi

    make_random_num

    make_credit_hash

    insert_credit_hash

    if [ $? != 0 ]; then
        response_body="{\"error\":\"user table is full\"}"
        response_status=" 404 Not Found"
    else
            response_body="{\"random\": $random_value}"
    fi
    login_end
#    printenv

    
fi
#echo "method error"
#printenv

