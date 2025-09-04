#!/usr/bin/haserl
<%
# check input vars for credit hash value
# search credit hash value in login table if not finde return error
# get line in login table and make new token with line and some other parameters (like JWT token)
# set jwt token to token table and user level of token and its start time and expier time
# make a function that give token and return userlevel for other platform usage
token_end() {
    echo "Status: $response_status"
    echo "Content-Type: application/json"
    echo ""

# Output JSON error message
    echo "$response_body"
    exit 0
}

search_login_table() {
    line=$(grep -m1 "$GET_credit" "$temp_logins")
    if [ -z "$line" ]; then
        #echo "User '$GET_user' not found"
        return 1
    fi
    credit_time="${line%%:*}"
    local rest="${line#*:}"
    credit_user="${rest%%:*}"
    rest="${rest#*:}"
    credit_hash="${rest%%:*}"
    rest="${rest#*:}"
    credit_level="${rest%%:*}"
    local now=$(date +%s)
    local timeout=$login_timeout
    if [ $((now - credit_time)) -ge "$timeout" ]; then
        #error in credit timeout
        return 1
    fi
    return 0
}

make_token() {
    # token=SHA(credit:time_now:username)
    token_time=$(date +%s)
    token_hash=$(printf "%s:%s:%s" "$credit_hash" "$token_time" "$credit_user" | sha1sum | awk '{print $1}')
    return 0
}

insert_token() {
    #insert token to the end of fifo with out any consideration 
    local table_line="$token_time:$credit_level:$token_hash"
    echo "$table_line" >> "$token_table_file"
    tail -n "$token_max_lines" "$token_table_file" > "${token_table_file}.tmp" && mv "${token_table_file}.tmp" "$token_table_file"
    return 0
}


token_table_file="/tmp/webui/tokens_table"
token_max_lines=5
temp_logins="/tmp/webui/tempLogins"
login_timeout=300
response_body=""
response_status=" 200 OK"

[ ! -d /tmp/webui ] && mkdir -p /tmp/webui

if [ "$REQUEST_METHOD" = "POST" ]; then

    if [ -z "$GET_credit" ]; then
        response_body="{\"error\":\"please insert credit in url\"}"
        response_status=" 404 Not Found"
        token_end
    fi
    search_login_table
    if [ $? != 0 ]; then
        response_body="{\"error\":\"credit not find in table or timed out\"}"
        response_status=" 404 Not Found"
        token_end
    fi
    make_token
    insert_token
    if [ $? != 0 ]; then
        response_body="{\"error\":\"token table error\"}"
        response_status=" 404 Not Found"
        token_end
    fi
    response_body="{\"token\":\"$token_hash\"}"
    token_end
fi
%>
