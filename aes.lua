local aes = require "resty.aes"
local str = require "resty.string"
local iv = 'ABCDEF1234123412'


-- 需要自己写一个函数将16进制转2进制
function hex2bin(hexstr)
    local str = ""
    for i = 1, string.len(hexstr) - 1, 2 do
        local doublebytestr = string.sub(hexstr, i, i+1);
        local n = tonumber(doublebytestr, 16);
        if 0 == n then
            str = str .. '\00'
        else
            str = str .. string.format("%c", n)
        end
    end
    return str
end

-- 加密函数,返回16进制
function encrypT(content, key)
    local aes_128_cbc_with_iv = assert(aes:new(key, nil, aes.cipher(128,"cbc"), {iv=iv}))
    local encrypted = aes_128_cbc_with_iv:encrypt(content)
    return str.to_hex(encrypted)
end

--  解密函数 返回解密字符串
function dencrypT(content, key)
    local aes_128_cbc_with_iv = assert(aes:new(key, nil, aes.cipher(128,"cbc"), {iv=iv}))
    local dencrypted = aes_128_cbc_with_iv:decrypt(hex2bin(content))
    return dencrypted
end

--ngx.say(encrypt('123456'))
--ngx.say(dencrypt('32e29ba66134e3d8f2c149a2b93006c7'))