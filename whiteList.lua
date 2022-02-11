function whiteExtCheck()
    local reqExt = string.match(ngx.var.uri, ".+%.(%w+)$")  --js
    for _,e in ipairs(whiteExt) do  -- js、css、png
        if reqExt == e then  -- 在白名单里
            return true
        end
    end
    return false
end