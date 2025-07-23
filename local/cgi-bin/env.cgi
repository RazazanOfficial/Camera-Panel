#!/usr/bin/haserl --upload-limit=4096 --upload-dir=/tmp/upload --accept-all=-1  --shell "/bin/sh --norc"
content-type: text/plain

<%# This is a sample "env" script %>
<% env %>
FILE_LIST=
<% ls /tmp/upload/ %>
POST_VARIABLE=
<%= $POST_var1 %>
<%= $POST_var2 %>
