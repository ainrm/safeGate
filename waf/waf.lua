local waf_sql = require "waf/sql"

--以后加规则配置、插件这些.现在不加
function waf_dispatch()
    waf_sql.waf_sql_filter()
end

waf_dispatch()
