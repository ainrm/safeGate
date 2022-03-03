local _M = {}
local ngx_base = require "resty.core.base"
local waf_rule = require "waf/rule"
local waf_voilation = require "waf/violation_list"
local waf_report = require "waf/report"

function _M.waf_sql_filter_params(arg_tables, filter_rule)
    if arg_tables then
        for key, val in pairs(arg_tables) do
            if match_string(val, filter_rule) then
                --ngx.say(key .. ":" .. val)
                waf_report.violation(waf_voilation.sql_detect)
            end
        end
    end
end

function _M.waf_sql_filter()
    --local get_arags = ngx.req.get_uri_args
    --for k, v in ipairs(get_arags) do
    --    print(v)
    --end
    if ngx_base.get_request() ~= nil then
        _M.waf_sql_filter_params(ngx.req.get_uri_args(), waf_rule.sql_get)
        ngx.say(get_cookie_raw())
        if match_string(get_cookie_raw(), waf_rule.sql_cookie) then
            waf_report.violation(waf_voilation.sql_detect)
        end

        local is_post_method = ngx.req.get_method() == "POST"
        if is_post_method then
            ngx.req.read_body()
            _M.waf_sql_filter_params(ngx.req.get_post_args(), waf_rule.sql_post)
        end
    end
end
return _M
