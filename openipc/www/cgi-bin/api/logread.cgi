#!/usr/bin/haserl
<%
source /var/www/cgi-bin/api/json.sh
response_body=" "
response_status=" 200 OK"

if [ "$REQUEST_METHOD" = "GET" ]; then
    count=0
    logs_json=""

    tmpfile=$(mktemp)
    logread | awk '{a[NR]=$0} END {for (i=NR; i>0; i--) print a[i]}' > "$tmpfile"

    while IFS= read -r line; do
        count=$((count + 1))
        entry=$(printf '{"no":%d,"log":"%s"}' "$count" "$(echo "$line" | sed 's/"/\\"/g')")
        if [ -z "$logs_json" ]; then
            logs_json="$entry"
        else
            logs_json="$logs_json,$entry"
        fi
    done < "$tmpfile"

    rm -f "$tmpfile"

    add_json_value "\"logs\": [$logs_json]"
fi

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
%>
