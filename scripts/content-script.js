// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * content-script.js 用于修改网页内容(content)的脚本. 它会在网页加载时执行. 运行于页面环境中.
 */

// 内容脚本的执行时机：
// 默认在DOMContentLoaded事件之后执行（又说不一定）。
// 指定时机：manifest中通过run_at属性，tabs.executeScript()中通过runAt属性。
// 指定时机值： document_start, document_end, document_idle
// document_start: 在DOMContentLoaded事件之前执行。document.body和head还不存在,可添加dom到document.documentElement元素上。
// 也可以通过MutationObserver来监听某个元素被添加到DOM，或等待DOMContentLoaded事件触发表明DOM可用。
// document_end: 在DOMContentLoaded事件之后执行。
// document_idle: 在document_end后执行某个时刻（大约DOMContentLoaded的200毫秒后），或者在window load事件后会立即触发。
console.log("content-script.js执行");
console.log("document.readyState:",document.readyState)  // 此时： interactive 且DOMContentLoaded事件触发后。
// document.addEventListener('DOMContentLoaded',()=>{}); // 此事件不触发，已经触发过了

document.addEventListener("readystatechange", ()=>{
    console.log("readyStatusChange事件触发:",document.readyState);   // complete
})

// 注入样式 (虽然动态注入,好控制, 但时机较晚,页面加载后再触发样式变化,而manifest中注入会立马覆盖,效果很好,但不好动态关闭,似乎CSSDOM中找不到,如同浏览器内置样式)
console.log("DOMContentLoaded事件触发");

// 自定义的样式
const customStyle=`
    *{ 
        font-family:"JetBrains Sans","PingFang SC", "Microsoft YaHei" !important; 
    }
    code, .code, [class^="code-"], .ace_editor * {
        font-family: "JetBrains Mono", "SF Mono", monospace !important; 
    }
`
// 重置样式 (用于覆盖自定义样式)
const resetStyle=`
    *{ 
        font-family: "PingFang SC", "Microsoft Yahei",Arial,"sans-serif" !important;
    }
`;

function addCustomStyle(){
    var style = document.createElement('style');
    style.id = "custom-style"; 
    style.innerHTML = customStyle;
    document.head.appendChild(style);

}
function removeCustomStyle(){
    // 删除插入的自定义样式
    var customStyle = document.getElementById('custom-style');
    customStyle && customStyle.remove()
    
    // 而通过manifest注入自定义的样式只能通过插入重置样式来覆盖,重复添加相同的样式,浏览器似乎会去重.
    var style = document.createElement('style');
    style.innerHTML = resetStyle
    document.head.appendChild(style);


}

// addStyle();   // 改为初始通过manifest中注入样式

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {  // 也会接收tabs.sendMessage()发送的消息
    console.log("接收到消息runtime:",message,sender,sendResponse);
    if(message.action==='addStyle'){
        addCustomStyle();
    }
    if(message.action==='removeStyle'){
        removeCustomStyle();
    }
    sendResponse("content-script.js收到消息");
});

// 内容脚本中无法访问chrome.tabs, 可通过消息传递机制与背景脚本通信
// chrome.tabs.onMessage.addListener((message, sender, sendResponse) => {});

// =========== 例子：修改网页背景色

// const body = document.querySelector("body")
// body.style.color = 'red' 
// body.style.fontFamily = 'Montserrat !important' // body的优先级太低, 效果不佳

// document.body.style.backgroundColor = "orange";
// document.styleSheets[0].addRule('*', 'color:red');
// document.styleSheets[0].addRule('*', 'font-family:Montserrat!important'); // 效果不错




// =========== 例子：RedingTime：添加一个阅读时间的徽章

// const article = document.querySelector('article');

// // `document.querySelector` may return null if the selector doesn't match anything.
// if (article) {
//   const text = article.textContent;
//   /**
//    * Regular expression to find all "words" in a string.
//    *
//    * Here, a "word" is a sequence of one or more non-whitespace characters in a row. We don't use the
//    * regular expression character class "\w" to match against "word characters" because it only
//    * matches against the Latin alphabet. Instead, we match against any sequence of characters that
//    * *are not* a whitespace characters. See the below link for more information.
//    *
//    * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
//    */
//   const wordMatchRegExp = /[^\s]+/g;
//   const words = text.matchAll(wordMatchRegExp);
//   // matchAll returns an iterator, convert to array to get word count
//   const wordCount = [...words].length;
//   const readingTime = Math.round(wordCount / 200);
//   const badge = document.createElement('p');
//   // Use the same styling as the publish information in an article's header
//   badge.classList.add('color-secondary-text', 'type--caption');
//   badge.textContent = `⏱️ ${readingTime} min read`;

//   // Support for API reference docs
//   const heading = article.querySelector('h1');
//   // Support for article docs with date
//   const date = article.querySelector('time')?.parentNode;

//   // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
//   (date ?? heading).insertAdjacentElement('afterend', badge);
// }
