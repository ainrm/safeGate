var tt = Date.parse(new Date());
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

function get_info(){
    str = '' + get_webdriver() + get_awvs() + get_appscan();
    return str;
}

function finalCookie(){
    arr.push(get_info())
    let fp = new Fingerprint();
    arr.push(fp.get());
    return arr
}


function setCookie(cname, date)
{
    var d = new Date();
    d.setTime(d.getTime()+(1*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + '=' + date + '; ' + expires + '; Path=/';
}

function aesEncrypt(word, tt) {
    let key = CryptoJS.enc.Utf8.parse(tt);
    const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}
tt = '000'+tt;
setCookie('h0yGbdRv', tt);
setCookie('kQpFHdoh', aesEncrypt(finalCookie(), tt));
