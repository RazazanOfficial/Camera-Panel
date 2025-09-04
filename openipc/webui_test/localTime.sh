#!/bin/sh

source ./json.sh
response_body=" "
localTime=$(date +"%Y-%m-%d %H:%M:%S")

add_json_value "\"local_time\": \"$localTime\""

echo "$response_body"
