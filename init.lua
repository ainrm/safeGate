require 'config'
require 'b64'
require 'aes'
require 'log'
require '403'
require 'tableXstring'
require 'fileio'
require 'randomStr'
require 'whiteList'

local optionIsOn = function (options) return options == "on" and true or false end
ToolsProtect = optionIsOn(toolsProtect)
ShiroProtect = optionIsOn(shiroProtect)
JsProtect = optionIsOn(jsProtect)
JsConfuse = false
SensitiveProtect = optionIsOn(sensitiveProtect)


-- cookie加密
function reqCookieParse()
    if ShiroProtect then
        local userCookieX9 = ngx.var.cookie_x9i7RDYX23
        if not userCookieX9 then  -- 没有cookie
            log('0-cookie 无cookie', '')
            ngx.req.set_header('Cookie', '') -- 移除其他cookie
        elseif #userCookieX9 < 32 then  -- 判断cookie长度
            log('1-cookie 不符合要求', userCookieX9)
            ngx.say('4')
            say_html()
        else  --有cookie
            local result = xpcall(dencrypT, emptyPrint, userCookieX9, aesKey)
            if not result then --解密失败
                log('2-cookie 无法解密', userCookieX9)
                ngx.say('5')
                say_html()
            else  --解密成功
                local originCookie = StrToTable(dencrypT(userCookieX9, aesKey))
                ngx.req.set_header('Cookie', transTable(originCookie))
                log('3-cookie 解密成功', userCookieX9)
            end
        end
    end
end

function respCookieEncrypt()
    if ShiroProtect then
        local value = ngx.resp.get_headers()["Set-Cookie"]
        if value then
            local encryptedCookie = cookieD.."="..encrypT(TableToStr(value), aesKey)
            ngx.header["Set-Cookie"] = encryptedCookie
            log('4-cookie 加密成功',encryptedCookie)
        end
    end
end

-- reload机制
function toolsInfoSpider()
    if ToolsProtect and not whiteExtCheck() then
        local clientCookieA = ngx.var.cookie_h0yGbdRv
        local clientCookieB = ngx.var.cookie_kQpFHdoh
        if not (clientCookieA and clientCookieB) then  --没有cookieA进入reload，302至html生成cookie后再请求原地址
            local ip = 'xxx'
            local finalPath = 'http://'..ip..'/'..jsPath..'?origin='..encodeBase64(ngx.var.request_uri)
            log('1-tools 无cookieA/B', '')
            ngx.redirect(finalPath, 302)
        else
            local result = xpcall(dencrypT, emptyPrint, clientCookieB, clientCookieA)
            if not result then
                log('2-tools 解密失败', clientCookieA..', '..clientCookieB)
                ngx.say('1')
                say_html() -- 解密失败
            else-- 可以解密，提取数据
                local result2 = dencrypT(clientCookieB, clientCookieA)
                if #result2 < 1 then
                    log('3-tools 解密失败', result2)
                else
                    local srs = split(result2, ',')
                    local _,e = string.find(srs[1], '0')
                    if e ~= nil then
                        log('4-tools 工具请求', result2)
                        ngx.say('2')
                        say_html()
                    else
                        log('0-tools 工具验证通过, 记录浏览器指纹', '', srs[2])
                    end
                end
            end
        end
    end
end

-- js文件混淆
function jsExtDetect()
    if JsProtect then
        local ext = string.match(ngx.var.uri, ".+%.(%w+)$")
        if ext == 'js' then  -- 加入检查，js文件是否存在
            JsConfuse = true
        end
    end
end

function jsConfuse()
    if JsConfuse then
        local originBody = ngx.arg[1]
        if #originBody > 200 then  -- 筛选空js
            local s = getRandom(8)
            local path = '/tmp/'..s
            writefile(path, originBody, 'w+')
            local t = io.popen('export NODE_PATH=/usr/lib/node_modules && node /gate/node/js_confuse.js  '..path)
            local a = t:read("*all")
            ngx.arg[1] = a
            os.execute('rm -f '..path)
        end
        JsConfuse = false
    end
end

-- 响应包过滤
function dateReplace()
    if SensitiveProtect then
        local replaceTelephone = string.gsub(ngx.arg[1], "[1][3,4,5,7,8]%d%d%d%d%d%d%d%d%d", "******")
        ngx.arg[1] = replaceTelephone
    end
end











