#!/bin/sh

#with only validate input token string with current table and return user_level that is important for application

token_table_file="/tmp/webui/tokens_table"
token_timeout=600 # 10 minutes to token expiered
token_notExist=255
token_expiered=254

validate_token() {
    if [ -z "$GET_token" ]; then
        response_body="{\"error\":\"need token in url\"}"
        return 255
    fi
    line=$(grep -m1 "$GET_token" "$token_table_file")
    if [ -z "$line" ]; then
        #echo "User '$GET_user' not found"
        response_body="{\"error\":\"token not exist\"}"
        return 255 #user level is 0 meaning to access 
    fi
    token_time="${line%%:*}"
    local rest="${line#*:}"
    token_level="${rest%%:*}"
    
    local now=$(date +%s)
    local timeout=$token_timeout
    if [ $((now - token_time)) -ge "$timeout" ]; then
        response_body="{\"error\":\"token expiered\"}"
        return 255
    fi
    return $token_level
}
