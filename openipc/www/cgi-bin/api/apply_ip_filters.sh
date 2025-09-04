#!/bin/sh

source /var/www/cgi-bin/api/json.sh

FIREWALL_FILE="/mnt/data/firewallsettings.tsv"

response_status="200 OK"
response_body=""

if [ ! -f "$FIREWALL_FILE" ]; then
    add_json_value "\"status\": \"error\""
    add_json_value "\"message\": \"No firewall settings file found.\""
    echo "Status: $response_status"
    echo "Content-Type: application/json"
    echo ""
    echo "$response_body"
    exit 0
fi

iptables -F INPUT

{
    read   # skip header
    while IFS=$'\t' read -r ip status; do
        [ -z "$ip" ] && continue
        case "$status" in
            allowed)
                iptables -A INPUT -s "$ip" -j ACCEPT
                ;;
            forbidden)
                iptables -A INPUT -s "$ip" -j DROP
                ;;
        esac
    done
} < "$FIREWALL_FILE"

add_json_value "\"status\": \"success\""
add_json_value "\"message\": \"Firewall rules applied successfully.\""

echo "Status: $response_status"
echo "Content-Type: application/json"
echo ""
echo "$response_body"
