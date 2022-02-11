//生成cookieB

// 随同页面下发，嵌入在返回体中

//js全局hook http请求
var arr = [];


function get_webdriver() {
    try {
        return !0 === _navigator.webdriver ? 0 : +!window.document.documentElement.getAttribute('webdriver')
    } catch (e) {
        return 1
    }
}
function get_awvs() {
    for (var e = [
        'SimpleDOMXSSClass',
        'MarvinHooks',
        'MarvinPageExplorer',
        'HashDOMXSSClass'
    ], t = e.length, r = window.$hook$, n = 0; n < t; n++) if (window[e[n]] && r) return 0;
    return 1
}
function get_appscan() {
    for (var e = [
      'appScanSendReplacement',
      'appScanOnReadyStateChangeReplacement',
      'appScanLoadHandler',
      'appScanSetPageLoaded'
    ], t = e.length, r = 0; r < t; r++) if (window[e[r]]) return 0;
    return 1
}

function getCookie(cookieName) {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    for(var i = 0; i < arrCookie.length; i++){
        var arr = arrCookie[i].split("=");
        if(cookieName == arr[0]){
            return arr[1];
        }
    }
    return "";
}

function get_info(){
    str = '' + get_webdriver() + get_awvs() + get_appscan();
    return str;
}

function finalCookie(){
    arr.push(get_info());
    let fp = new Fingerprint();
    arr.push(fp.get());
    return arr
}

function setCookie(cname, data) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + '=' + data + '; ' + expires + '; Path=/';
}

function aesEncrypt(word, tt) {
    let key = CryptoJS.enc.Utf8.parse(tt);
    const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}


var tt = getCookie("h0yGbdRv");
var cookieV = aesEncrypt(finalCookie(), tt);


function hookAJAX() {
    XMLHttpRequest.prototype.nativeOpen = XMLHttpRequest.prototype.open;
    var customizeOpen = function (method, url, async, user, password) {
        // do something
        setCookie('kQpFHdoh', cookieV);
        this.nativeOpen(method, url, async, user, password);
    };
    XMLHttpRequest.prototype.open = customizeOpen;
}

/**
 *全局拦截Image的图片请求添加token
 *
 */
function hookImg() {
    const property = Object.getOwnPropertyDescriptor(Image.prototype, 'src');
    const nativeSet = property.set;

    function customiseSrcSet(url) {
        // do something
        setCookie('kQpFHdoh', cookieV);
        nativeSet.call(this, url);
    }
    Object.defineProperty(Image.prototype, 'src', {
        set: customiseSrcSet,
    });
}

/**
 * 拦截全局open的url添加token
 *
 */
function hookOpen() {
    const nativeOpen = window.open;
    window.open = function (url) {
        // do something
        setCookie('kQpFHdoh', cookieV);
        nativeOpen.call(this, url);
    };
}

function hookFetch() {
    var fet = Object.getOwnPropertyDescriptor(window, 'fetch')
    Object.defineProperty(window, 'fetch', {
        value: function (a, b, c) {
            // do something
            setCookie('kQpFHdoh', cookieV);
            return fet.value.apply(this, args)
        }
    })
}


//setCookie('kQpFHdoh', cookieV);
hookAJAX();
hookImg();
hookOpen();
hookFetch();


