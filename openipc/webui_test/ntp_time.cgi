#!/usr/bin/haserl
<%
source ./json.sh
response_body=" "
response_status=" 200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
    ntp_server=$(grep -E "^server " /etc/ntp.conf | head -n1 | awk '{print $2}')
    if [ -z "$ntp_server" ]; then
        ntp_server="Not Configured"
    fi
    add_json_value "\"ntp_server\": \"$ntp_server\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_ntp_server" ]; then
        awk -v n="$POST_ntp_server" 'BEGIN{r=0} /^server / && r==0 {print "server " n " iburst"; r=1; next} {print}' /etc/ntp.conf > /tmp/ntp.conf.$$
        mv /tmp/ntp.conf.$$ /etc/ntp.conf
        add_json_value "\"ntp_server\": \"$POST_ntp_server\""
    else
        add_json_value "\"error\": \"ntp_server not provided\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
