local _M = {}
function _M.violation(result)
    full_violation_text = "violation: \n"
    if result == g_violation_sql_detect then
        g_result_sql_detect = full_violation_text .. "SQL Injection detected \n"
    end
    full_violation_text = full_violation_text .. ngx.var.request_uri .. " \n"
    log(violation)
    say_html()
end
return _M
