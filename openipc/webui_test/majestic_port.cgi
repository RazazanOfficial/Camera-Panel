#!/usr/bin/haserl
<%
source ./json.sh
CONFIG_FILE="/etc/majestic.yaml"

response_body=" "
response_status=" 200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
    /etc/init.d/S95majestic restart
    http_port=$(yaml-cli -i $CONFIG_FILE -g .system.webPort)
    https_port=$(yaml-cli -i $CONFIG_FILE -g .system.httpsPort)
    rtsp_port=$(yaml-cli -i $CONFIG_FILE -g .rtsp.port)

    add_json_value "\"http_port\": \"$http_port\""
    add_json_value "\"https_port\": \"$https_port\""
    add_json_value "\"rtsp_port\": \"$rtsp_port\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -n "$POST_http_port" ] || [ -n "$POST_https_port" ] || [ -n "$POST_rtsp_port" ]; then
        
        if [ -n "$POST_http_port" ]; then
            yaml-cli -i $CONFIG_FILE -s .system.webPort "$POST_http_port"
            add_json_value "\"http_port\": \"$POST_http_port\""
        fi

        if [ -n "$POST_https_port" ]; then
            yaml-cli -i $CONFIG_FILE -s .system.httpsPort "$POST_https_port"
            add_json_value "\"https_port\": \"$POST_https_port\""
        fi

        if [ -n "$POST_rtsp_port" ]; then
            yaml-cli -i $CONFIG_FILE -s .rtsp.port "$POST_rtsp_port"
            add_json_value "\"rtsp_port\": \"$POST_rtsp_port\""
        fi

        /etc/init.d/S95majestic restart

    else
        add_json_value "\"error\": \"No port provided in POST data\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
