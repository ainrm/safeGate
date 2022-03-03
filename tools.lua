function i_get_cookie(s_cookie)
    local cookie = {}

    -- string.gfind is renamed to string.gmatch
    for item in string.gmatch(s_cookie, "[^;]+") do
        local _, _, k, v = string.find(item, "^%s*(%S+)%s*=%s*(%S+)%s*")
        if k ~= nil and v ~= nil then
            cookie[k] = v
        end
    end

    return cookie
end

function get_cookie_table()
    local raw_cookie = ngx.req.get_headers()["Cookie"]
    if raw_cookie ~= nil then
        return i_get_cookie(raw_cookie)
    end
    return nil
end

function get_cookie_raw()
    return ngx.req.get_headers()["Cookie"]
end

function match_string(input_str, rule)
    if input_str == nil then
        return false
    end
    local from, to, err = ngx.re.find(input_str, rule, "jo")
    return from ~= nil
end
