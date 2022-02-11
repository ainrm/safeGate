const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const fs = require('fs');


const argv = process.argv
const fileParam = argv[2]


const jscode = fs.readFileSync(fileParam, {
        encoding: "utf-8"
    });


let ast = parser.parse(jscode);

// 字符串转unicode
function string2unicode(str){
    let ret ="";
    for(let i=0; i<str.length; i++){
       ret += "\\u" + "00" + str.charCodeAt(i).toString(16);  //字符串的charCodeAt方法转化成16进制ascii编码，再加上\u00前缀
      }
       return ret;
}

// 双重base64解码函数
function double_b64_decode(sss){
    return atob(atob(sss));
}

// 双重base64编码函数
function double_b64_encode(sss){
    return btoa(btoa(sss));
}

// 转化为异或表达式
function num2xor(num){
    let key = parseInt(Math.random() * 999999, 10);  // 生成随机数
    let cipherNum = key ^ num;
    return [key, cipherNum];
}

// 转化为减法运算表达式
function num2add(num){
    let key = parseInt(Math.random() * 999999, 10);  // 生成随机数
    let cipherNum = key - num;
    return [key, cipherNum];
}

// 生成随机字符串
function randomString(len) {
　　len = len || 32;
　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　var maxPos = $chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
　　}
　　return pwd;
}

let strList = [];



const visitor = {
    // 改变对象的访问方式
    MemberExpression(path){
        if (path.node.computed == false){  // computed为false时执行
            //const name = path.get('property').toString();  // toString方法获取原始值
            const name = path.node.property.name;  // node节点获取原始值
            path.node.property = t.stringLiteral(name);  // 将原始值赋值给property
            path.node.computed = true;  // 改变computed为true
        }
    },
    // 标识符unicode编码
    Identifier(path){
        const src_value = path.node.name;  // 获取原始值
        path.replaceWith(t.Identifier(string2unicode(src_value)));  // 使用replace替换当前节点为unicode编码后的数据
        path.skip();  // 跳过当前节点防止死循环，新生成的ast树也存在标识符
    },
    // 字符串双重base64编码
    StringLiteral(path){  // 改变字符串为函数表达式
        const src_value = path.node.value;  // 获取原始值
        const en_Str = t.CallExpression(
                t.identifier('double_b64_decode'),  // 函数名
                [t.stringLiteral(double_b64_encode(src_value))]  // 加密后的字符串
            )
        path.replaceWith(en_Str);
        path.skip();
    },
    // 数值位异或加密
    NumericLiteral(path){
        const src_value = path.node.value;  // 获取原始值
        let xxx = num2add(src_value);  // 将原始值分解成减法运算表达式
        let xxx_2 = num2xor(xxx[0]);  // 将减法运算表达式左边的值转变为异或表达式
        let xxx_3 = num2xor(xxx[1]);  // 将减法运算表达式右边的值转变为异或表达式
        path.replaceWith(t.binaryExpression('-',   // 替换原始数字字面量
            t.binaryExpression('^', t.NumericLiteral(xxx_2[0]), t.NumericLiteral(xxx_2[1])), 
            t.binaryExpression('^', t.NumericLiteral(xxx_3[0]), t.NumericLiteral(xxx_3[1]))
        ));
        path.skip();
    },
    // 数组混淆
    StringLiteral(path){
        let srcValue = double_b64_encode(path.node.value);  // 双重base64编码原始数据
        let index = strList.indexOf(srcValue);  // 字符串的indexOf方法查询srcValue是否已存在
        if (index == -1){  // 不存在时将srcValue加入数组
            let length = strList.push(srcValue);  // 数组的push方法会将值加入最后并返回数组长度
            index = length - 1;  // 数组以0开始计数，-1则表示最后一个值得位置
        }
        path.replaceWith(t.CallExpression(
            t.identifier('double_b64_decode'),
            [t.memberExpression(
                t.identifier('Arr'),
                t.numericLiteral(index),  // 写入数组下标
                true
                )]
            ));
    },
    // 二项式转花指令
    BinaryExpression(path){
        let xxx = "_" + randomString(4);  // 生成随机字符串
        let left = path.node.left;  // 获取原始二项式左边值
        let right = path.node.right;  // 获取原始二项式右边值
        let operator = path.node.operator;  // 获取原始二项式运算符
        let j = t.identifier('j');
        let k = t.identifier('k');

        path.replaceWith(t.CallExpression(  // 将二项式替换为函数
                t.identifier(xxx),  // 函数名为随机字符串
                [left, right]  // 函数参数为原始二项式参数
            ));

        let newFunc = t.functionDeclaration(  // 新增用于处理花指令的函数
                t.identifier(xxx),
                [j, k],
                t.blockStatement(
                        [t.returnStatement(
                                t.binaryExpression(operator,j,k)
                            )]
                    )
            )
        let rootPath = path.findParent(  // 向上查找，返回根节点
                function(p){
                    return p.isProgram();
                }
            )
        rootPath.node.body.unshift(newFunc);  // 在根节点创建花指令函数
    },
    //  指定行加密
    FunctionDeclaration(path){
        let tmp = path.node.body;
        let body = tmp.body.map(function(p){  // 遍历body下每一个子节点
            if (t.isReturnStatement(p)) {return p};  // 不对return做操作
            let src_code = generator(p).code;  // 将ast还原为js代码
            let ciperCode = double_b64_encode(src_code);  // 对js代码进行加密处理
            let ciperFunc = t.callExpression(  // 生成double_b64_decode表调用达式
                    t.identifier('double_b64_decode'),
                    [t.stringLiteral(ciperCode)]
                );
            let newFunc = t.callExpression(  // 生成eval调用表达式
                    t.identifier('eval'),
                    [ciperFunc]
                );
            return t.expressionStatement(newFunc);  // 单个节点处理完成，返回表达式节点
        })
        path.get('body').replaceWith(t.blockStatement(body));  // 替换原有body
    },
}

traverse(ast, visitor);

// 增加Arr数组
strList = strList.map(function(sss){  // 将数组转化为节点形式
    return t.StringLiteral(sss);
})
let var_tion = t.variableDeclaration('var',
    [t.variableDeclarator(
        t.identifier('Arr'),
        t.arrayExpression(strList)
    )]
)
ast.program.body.unshift(var_tion);


// 增加double_b64_decode函数
let fun_tion = t.functionDeclaration(
    t.identifier('double_b64_decode'),
    [t.identifier('sss')],
    t.blockStatement(
        [t.returnStatement(
            t.CallExpression(
                t.identifier('atob'),
                [t.CallExpression(
                    t.identifier('atob'),
                    [t.identifier('sss')]
                    )]
                )
        )]
    )
)
ast.program.body.unshift(fun_tion);


let code = generator(ast, {
    compact: true,  // 是否去除空格
    comments: false,  // 是否显示注释
}).code;
console.log(code);
//fs.writeFile('./demoNew.js', code, (err)=>{});
