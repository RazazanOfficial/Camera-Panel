#!/bin/sh

source ./json.sh
CONFIG_FILE="/etc/majestic.yaml"
response_body=" "
response_status=" 200 OK"

yaml_get() {
    yaml-cli -i "$CONFIG_FILE" -g "$1" 2>/dev/null
}

build_stream_json() {
    s="$1"
    stype="$2"
    size="$(yaml_get .${s}.size)"
    rcMode="$(yaml_get .${s}.rcMode)"
    fps="$(yaml_get .${s}.fps)"
    bitrate="$(yaml_get .${s}.bitrate)"
    profile="$(yaml_get .${s}.profile)"
    gopSize="$(yaml_get .${s}.gopSize)"
    printf '{'
    printf '"Stream Type":"%s",' "$stype"
    printf '"Resolution":"%s",' "$size"
    printf '"Bitrate Type":"%s",' "$rcMode"
    printf '"Frame Rate(FPS)":"%s",' "$fps"
    printf '"Max. Bitrate(Kbps)":"%s",' "$bitrate"
    printf '"Profile":"%s",' "$profile"
    printf '"I Frame Interval":"%s"' "$gopSize"
    printf '}'
}

set_if_present() {
    _stream="$1"
    _field="$2"
    _postvar="$3"
    _val="$(eval "printf '%s' \"\$POST_${_postvar}\"")"
    if [ -n "$_val" ]; then
        yaml-cli -i "$CONFIG_FILE" -s .${_stream}.${_field} "$_val"
        return 0
    fi
    return 1
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    v0_json="$(build_stream_json video0 0)"
    v1_json="$(build_stream_json video1 1)"
    add_json_value "\"video0\": $v0_json"
    add_json_value "\"video1\": $v1_json"
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    case "$POST_type" in
        0) target_stream="video0" ;;
        1) target_stream="video1" ;;
        *) response_status=" 400 Bad Request"
           add_json_value "\"error\": \"Invalid or missing POST_type. Use 0 or 1.\""
           echo "Status: $response_status"
           echo "Content-Type: application/json"
           echo ""
           echo "$response_body"
           exit 0
           ;;
    esac

    set_if_present "$target_stream" size    resolution
    set_if_present "$target_stream" rcMode  bitrate_type
    set_if_present "$target_stream" fps     frame_rate_fps
    set_if_present "$target_stream" bitrate max_bitrate_kbps
    set_if_present "$target_stream" profile profile
    set_if_present "$target_stream" gopSize i_frame_interval

    v0_json="$(build_stream_json video0 0)"
    v1_json="$(build_stream_json video1 1)"
    add_json_value "\"video0\": $v0_json"
    add_json_value "\"video1\": $v1_json"
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
