/**
 *  疫情日报，自动获取当前位置的疫情信息
 *  API来自 http://api.tianapi.com/txapi/ncov/
 *  @author: Peng-YM
 *  感谢 @Mazetsz 提供腾讯API接口Token
 *  更新地址: https://raw.githubusercontent.com/Peng-YM/QuanX/master/Tasks/nCov.js
 */

const $ = API("nCov");

const key = "NOUBZ-7BNHD-SZ64A-HUWCW-YBGZ7-DDBNK";
const headers = {
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36",
};

!(async () => {
    // get current location
    const province = await $.http.get(`https://apis.map.qq.com/ws/location/v1/ip?key=${key}`).then(resp => {
        const data = JSON.parse(resp.body);
        return data.result.ad_info.province;
    });
    $.log(province);
    console.log(province);
    const newslist = await $.http.get({
        url: "http://api.tianapi.com/ncov/index?key=99f29842abf83c3859dfd19ccf6abc4f",
        headers,
    }).then((resp) => JSON.parse(resp.body).newslist[0])
        .delay(1000);
    $.log(newslist);
    console.log(newslist);
    let desc = newslist.desc;
    let news = newslist.news[0];
    let risk = newslist.riskarea;
    let title = "🗞【疫情信息概览】" + `${formatTime()}`;
    let subtitle = news.title;
    var currentCityHigh = [];
    var currentCityMid = [];
    let high = risk.high;
    high.forEach(v=>{
    if(v.indexOf(province) != -1) {
        currentCityHigh.push(v);
    }
    });
    let mid = risk.mid;
    mid.forEach(v=>{
    if(v.indexOf(province) != -1) {
        currentCityMid.push(v);
    }
    });
    if (currentCityHigh.length == 0){
        currentCityHigh.push("无");
    }
    if (currentCityMid.length == 0){
        currentCityMid.push("无");
    }
    let detail =
        "\n\n「疫情动态」\n\n     " +
        news.title +
        "\n\n「动态详情」\n\n     " +
        news.summary +
        `\n\n「${province}高风险地区」\n\n     ` +
        currentCityHigh +
        `\n\n「${province}中风险地区」\n\n     ` +
        currentCityMid +
        "\n\n「全国数据」" +
        "\n\n    -新增境外输入: " +
        desc.foreignStatistics.suspectedIncr +
        "\n    -现有确诊: " +
        desc.currentConfirmedCount +
        "\n    -现有无症状: " +
        desc.seriousCount +
        "\n    -累计确诊: " +
        desc.confirmedCount +
        "\n    -治愈: " +
        desc.curedCount +
        "\n    -死亡: " +
        desc.deadCount +
        "\n\n    发布时间：" +
        news.pubDateStr;
    $.notify(title, subtitle, detail);
})()
    .catch((err) => $.error(err))
    .finally(() => $.done());

function formatTime() {
    const date = new Date();
    return `${
        date.getMonth() + 1
    }月${date.getDate()}日 ${date.getHours()}时`;
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!t,i="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!i,isJSBox:i,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:i,isScriptable:n,isNode:o}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/;const u={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(l=>u[l.toLowerCase()]=(u=>(function(u,l){l="string"==typeof l?{url:l}:l;const h=e.baseURL;h&&!r.test(l.url||"")&&(l.url=h?h+l.url:l.url);const a=(l={...e,...l}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...l.events};let f,d;if(c.onRequest(u,l),t)f=$task.fetch({method:u,...l});else if(s||i||o)f=new Promise((e,t)=>{(o?require("request"):$httpClient)[u.toLowerCase()](l,(s,i,n)=>{s?t(s):e({statusCode:i.status||i.statusCode,headers:i.headers,body:n})})});else if(n){const e=new Request(l.url);e.method=u,e.headers=l.headers,e.body=l.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}const p=a?new Promise((e,t)=>{d=setTimeout(()=>(c.onTimeout(),t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)),a)}):null;return(p?Promise.race([p,f]).then(e=>(clearTimeout(d),e)):f).then(e=>c.onResponse(e))})(l,u))),u}function API(e="untitled",t=!1){const{isQX:s,isLoon:i,isSurge:n,isNode:o,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(o){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(i||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),o){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(i||n)&&$persistentStore.write(e,this.name),o&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||i)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);o&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||i?$persistentStore.read(e):s?$prefs.valueForKey(e):o?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||i)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);o&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",l="",h={}){const a=h["open-url"],c=h["media-url"];if(s&&$notify(e,t,l,h),n&&$notification.post(e,t,l+`${c?"\n多媒体:"+c:""}`,{url:a}),i){let s={};a&&(s.openUrl=a),c&&(s.mediaUrl=c),"{}"===JSON.stringify(s)?$notification.post(e,t,l):$notification.post(e,t,l,s)}if(o||u){const s=l+(a?`\n点击跳转: ${a}`:"")+(c?`\n多媒体: ${c}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||i||n?$done(e):o&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
/*****************************************************************************/


