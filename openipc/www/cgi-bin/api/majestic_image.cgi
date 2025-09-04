#!/usr/bin/haserl
<%
source /var/www/cgi-bin/api/json.sh

CONFIG_FILE="/etc/majestic.yaml"
response_body=" "
response_status=" 200 OK"

yaml_get() {
    yaml-cli -i "$CONFIG_FILE" -g "$1" 2>/dev/null
}

yaml_set() {
    yaml-cli -i "$CONFIG_FILE" -s "$1" "$2" >/dev/null 2>&1
}

build_image_json() {
    mirror="$(yaml_get .image.mirror)"
    flip="$(yaml_get .image.flip)"
    contrast="$(yaml_get .image.contrast)"
    hue="$(yaml_get .image.hue)"
    saturation="$(yaml_get .image.saturation)"
    luminance="$(yaml_get .image.luminance)"
    rotate="$(yaml_get .image.rotate)"
    tuning="$(yaml_get .image.tuning)"

    antiFlicker="$(yaml_get .isp.antiFlicker)"
    drc="$(yaml_get .isp.drc)"
    slowShutter="$(yaml_get .isp.slowShutter)"
    rawMode="$(yaml_get .isp.rawMode)"
    dis="$(yaml_get .isp.dis)"

    printf '{'
    printf '"mirror":"%s",'     "$mirror"
    printf '"flip":"%s",'       "$flip"
    printf '"contrast":"%s",'   "$contrast"
    printf '"hue":"%s",'        "$hue"
    printf '"saturation":"%s",' "$saturation"
    printf '"luminance":"%s",'  "$luminance"
    printf '"rotate":"%s",'     "$rotate"
    printf '"tuning":"%s",'     "$tuning"
    printf '"antiFlicker":"%s",' "$antiFlicker"
    printf '"drc":"%s",'         "$drc"
    printf '"slowShutter":"%s",' "$slowShutter"
    printf '"rawMode":"%s",'     "$rawMode"
    printf '"dis":"%s"'          "$dis"
    printf '}'
}

set_if_present() {
    _path="$1"
    _postvar="$2"
    _val="$(eval "printf '%s' \"\$POST_${_postvar}\"")"
    if [ -n "$_val" ]; then
        yaml_set "$_path" "$_val"
        return 0
    fi
    return 1
}

if [ "$REQUEST_METHOD" = "GET" ]; then
    img_json="$(build_image_json)"
    add_json_value "\"image\": $img_json"
fi

if [ "$REQUEST_METHOD" = "POST" ]; then
    #Image
    set_if_present .image.mirror     mirror
    set_if_present .image.flip       flip
    set_if_present .image.contrast   contrast
    set_if_present .image.hue        hue
    set_if_present .image.saturation saturation
    set_if_present .image.luminance  luminance
    set_if_present .image.rotate     rotate
    set_if_present .image.tuning     tuning

    #ISP
    set_if_present .isp.antiFlicker  antiFlicker
    set_if_present .isp.drc          drc
    set_if_present .isp.slowShutter  slowShutter
    set_if_present .isp.rawMode      rawMode
    set_if_present .isp.dis          dis

    img_json="$(build_image_json)"
    add_json_value "\"image\": $img_json"
fi

if [ "$REQUEST_METHOD" != "GET" ] && [ "$REQUEST_METHOD" != "POST" ]; then
    response_status=" 405 Method Not Allowed"
    add_json_value "\"error\": \"Only GET and POST are supported.\""
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
