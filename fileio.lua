function readfile(path)
      local file = io.open(path, "r")
      if file then
        local content = file:read("*a")
        io.close(file)
        return content
      end
      return nil
end

function writefile(path, content, mode)
      mode = mode or "w+b"
      local file = io.open(path, mode)
      if file then
        if file:write(content) == nil then return false end
        io.close(file)
        return true
      else
        return false
      end
end