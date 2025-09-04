#!/bin/sh

source ./json.sh

json_content=""
response_body=""
response_status="200 OK"

DIR="/tmp/folder"

if [ "$REQUEST_METHOD" = "POST" ]; then
    if [ -d "$DIR" ]; then
        rm -rf "$DIR"
        add_json_value '"status": "success"'
        add_json_value '"message": "Folder deleted."'
    else
        response_status="404 Not Found"
        add_json_value '"status": "error"'
        add_json_value '"message": "Folder not found."'
    fi
else
    response_status="405 Method Not Allowed"
    add_json_value '"status": "error"'
    add_json_value '"message": "Only POST method allowed."'
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"

