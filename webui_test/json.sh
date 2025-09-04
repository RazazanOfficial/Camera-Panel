#!/bin/sh

json_content=""

add_json_value() {
    if [ -z "$json_content" ]; then
        json_content="$1"
    else
        json_content="$json_content, $1"
    fi
    response_body="{ $json_content }"
}

