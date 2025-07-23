#!/usr/bin/haserl
Content-type: text/html

<html>
<body>
<table border=1><tr>
<% for a in Red Blue Yellow Cyan; do %>                                                                       
        <td bgcolor="<% echo -n "$a" %>"><% echo -n "$a" %></td>                                              
        <% done %>
</tr></table>
</body>
</html>

