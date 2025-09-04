#!/usr/bin/haserl
<%
serial_num_file="/tmp/webui/serial"
system_name_file="/tmp/webui/system_name"
system_model_file="/tmp/webui/system_model"
system_number_file="/tmp/webui/system_number"


add_serial_num() {
    if [ -s "$serial_num_file" ]; then
        serial_number=$(cat "$serial_num_file")
        add_json_value "\"system_serial\": \"$serial_number\""
    fi
}

add_system_name() {
    if [ -s "$system_name_file" ]; then
        system_name=$(cat "$system_name_file")
        add_json_value "\"system_name\": \"$system_name\""
    fi
}

add_system_number() {
    if [ -s "$system_number_file" ]; then
        system_number=$(cat "$system_number_file")
        add_json_value "\"system_number\": \"$system_number\""
    fi
}

add_system_model() {
    if [ -s "$system_model_file" ]; then
        system_model=$(cat "$system_model_file")
        add_json_value "\"system_model\": \"$system_model\""
    fi
}


set_serial_num() {
#check file is empty
    #for now not possible to set serial number
    return 1
}

set_system_name() {
    if [ -z "$1" ]; then
        return 1
    fi
    #check constrait on input variable
    echo -e "$1" > "$system_name_file"
    return 0
}

set_system_number() {
   if [ -z "$1" ]; then
        return 1
    fi
    #check number is ok 
    echo -e "$1" > "$system_number_file"
    return 0
}

set_system_model() {
#not posible to change this file content
    return 1
}


system_info_end() {
    echo "Status: $response_status"
    echo "Content-Type: application/json"
    echo ""

# Output JSON error message
    echo "$response_body"
    exit 0
}

get_system_info() {
    #
    local info_name=$1
    if [ $info_name == "system_serial" ]; then
        add_serial_num
    elif [ $info_name == "system_name" ]; then
        add_system_name
    elif [ $info_name == "system_num" ]; then
        add_system_number
    elif [ $info_name == "system_model" ]; then
        add_system_model
    fi
}

set_system_info() {
    local info_name=$1
    if [ $info_name == "system_serial" ]; then
        set_serial_num $2
        if [ $? !=0 ]; then
            add_serial_num
        fi
    elif [ $info_name == "system_name" ]; then
        set_system_name $2
        add_system_name
    elif [ $info_name == "system_num" ]; then
        set_system_number $2
        add_system_number
    elif [ $info_name == "system_model" ]; then
        set_system_model $2
        if [ $? !=0 ]; then
            add_system_model
        fi
    fi
}

response_body="{}"
response_status=" 200 OK"

source ./validate_token.sh
source ./json.sh

#first check token
#validate_token
#user_level=$?
#if [ $user_level == 255 ]; then
#    response_status=" 404 Not Found"
#    system_info_end
#fi
#if [ $user_level == 0 ]; then
#    response_body="{\"error\":\"user level error\"}"
#    response_status=" 404 Not Found"
#    system_info_end
#fi
#
#
if [ "$REQUEST_METHOD" = "GET" ]; then
#check for each parameter is in url and then call add value function 
    for info_param in $(printenv | grep GET_ | sort); do
	    param=$(echo ${info_param#GET_} | cut -d= -f1)
	    newval=$(echo ${info_param#GET_} | cut -d= -f2)
        get_system_info $param $newval
    done

fi
if [ "$REQUEST_METHOD" = "POST" ]; then
#check for each parameter in POST variables and if user level is ok set parameter with it's value and add it to resposne after set
    for info_param in $(printenv | grep POST_ | sort); do
	    param=$(echo ${info_param#POST_} | cut -d= -f1)
	    newval=$(echo ${info_param#POST_} | cut -d= -f2)
        set_system_info $param $newval
    done
fi


#response_body="{\"response\":\"token validate OK level:$user_level\"}"
system_info_end

%>
