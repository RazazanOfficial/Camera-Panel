#!/bin/sh

source ./json.sh
CONFIG_FILE="/etc/majestic.yaml"

response_body=" "
response_status=" 200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
    codec=$(yaml-cli -i "$CONFIG_FILE" -g .audio.codec)
    volume=$(yaml-cli -i "$CONFIG_FILE" -g .audio.volume)

    [ -n "$codec" ] && add_json_value "\"codec\": \"$codec\""
    [ -n "$volume" ] && add_json_value "\"volume\": \"$volume\""
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    changed=0

    if [ -n "$POST_codec" ]; then
        yaml-cli -i "$CONFIG_FILE" -s .audio.codec "$POST_codec"
        add_json_value "\"codec\": \"$POST_codec\""
        changed=1
    fi

    if [ -n "$POST_volume" ]; then
        yaml-cli -i "$CONFIG_FILE" -s .audio.volume "$POST_volume"
        add_json_value "\"volume\": \"$POST_volume\""
        changed=1
    fi

    if [ "$changed" -eq 0 ]; then
        add_json_value "\"error\": \"No audio field provided in POST data\""
        response_status=" 400 Bad Request"
    fi
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
