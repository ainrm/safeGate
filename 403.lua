function emptyPrint()
end

function say_html()
    ngx.header.content_type = "text/html"
    ngx.status = ngx.HTTP_FORBIDDEN
    ngx.say(html)
    ngx.exit(ngx.status)
end