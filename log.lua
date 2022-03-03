require "config"

local optionIsOn = function(options)
    return options == "on" and true or false
end
local Attacklog = optionIsOn(attacklog)
local logpath = logdir

local function getClientIp()
    IP = ngx.var.remote_addr
    if IP == nil then
        IP = "unknown"
    end
    return IP
end

local function write(logfile, msg)
    local fd = io.open(logfile, "ab")
    if fd == nil then
        return
    end
    fd:write(msg)
    fd:flush()
    fd:close()
end

function log(data, ruletag, fp)
    if Attacklog then
        local fingerprint = fp or ""
        local realIp = getClientIp()
        local method = ngx.var.request_method
        local ua = ngx.var.http_user_agent
        local servername = ngx.var.server_name
        local url = ngx.var.request_uri
        local time = ngx.localtime()
        if ua then
            line =
                realIp ..
                " [" ..
                    time ..
                        '] "' ..
                            method ..
                                " " ..
                                    servername ..
                                        url ..
                                            '" "' ..
                                                ruletag ..
                                                    '"  "' .. ua .. '" "' .. data .. '" "' .. fingerprint .. '"\n'
        else
            line =
                realIp ..
                " [" ..
                    time ..
                        '] "' ..
                            method ..
                                " " ..
                                    servername ..
                                        url .. '" "' .. ruletag .. '" - "' .. data .. '" "' .. fingerprint .. '"\n'
        end
        local filename = logpath .. "/" .. servername .. "_" .. ngx.today() .. "_sec.log"
        write(filename, line)
    end
end
