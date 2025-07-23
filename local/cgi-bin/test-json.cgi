#!/usr/bin/haserl --shell=/bin/sh
<%
# 1. First set content type
echo "Content-Type: application/json"
echo ""

# 2. Create debug log
{
  echo "=== START DEBUG ==="
  echo "Current time: $(date)"
  echo "--- Environment ---"
  env
  echo "--- Raw Input ---"
  cat | tee /tmp/raw_input.tmp
} > /tmp/upload_debug.log 2>&1

# 3. Manual multipart parsing (since haserl isn't auto-processing)
BOUNDARY=$(grep -m1 'boundary=' /tmp/upload_debug.log | sed 's/.*boundary=//;s/[^a-zA-Z0-9].*//')
[ -z "$BOUNDARY" ] && BOUNDARY="--------------------------[a-z0-9]+"

# 4. Extract files manually
awk -v boundary="$BOUNDARY" '
BEGIN {
  RS="\r\n--" boundary
  upload_dir="/tmp"
}
/Content-Disposition:.*filename=/ {
  if (match($0, /filename="([^"]*)"/, m)) {
    filename = m[1]
    getline  # Skip Content-Type
    getline  # Skip empty line
    outfile = upload_dir "/" filename
    print "Saving to: " outfile > "/tmp/upload_debug.log"
    while ((getline > 0) && ($0 !~ "^--" boundary)) {
      print > outfile
    }
    close(outfile)
  }
}
' /tmp/raw_input.tmp

# 5. Check results
if [ -f "/tmp/test.txt" ]; then
  echo '{"status":"success","file":"/tmp/test.txt","content":"'"$(cat /tmp/test.txt | tr '\n' ' ' | head -c 100)"'"}'
else
  echo '{"status":"error","message":"No file processed","debug":"/tmp/upload_debug.log"}'
fi
%>
