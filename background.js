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
 * 后台脚本: 运行于插件运行环境中. 故不能直接访问页面DOM,须通过chrome.scprining接口
 */

console.log("background.js执行");  // 日志查看：点击“service-worker服务工作进程”查看。
const ON = '';
const OFF = 'OFF';

// 插件安装时触发: （或插件或浏览器更新时）
// 可执行设置初始状态或完成某些任务   
// 可以将应用状态保存在Storage和IndexedDB中。

chrome.runtime.onInstalled.addListener( async() => { 
    console.log("onInstalled事件触发");
    chrome.action.setBadgeText({text: ON,});
});
// 新建tab页时触发，输入地址或刷新页面不触发。 // 为什么是tab,因为一个tab例可能有很多个页面(document,frame);
chrome.tabs.onCreated.addListener(async (tab) => { 
    // console.log("onCreated事件触发",tab); 
});
// 点击tab页时触发。
chrome.tabs.onActivated.addListener(async (activeInfo) => { 
    // console.log("onActivated事件触发",activeInfo); 
});

// 刷新页面是触发多次。根据changeInfo.status判断
chrome.tabs.onUpdated.addListener(async (tabId,changeInfo,tab) => { 
    // console.log("onUpdated事件触发", changeInfo.status,changeInfo); 
});

// 当该插件被点击时触发：
// 注意：如果配置了default_popup，则点击图标不会触发该事件
const blockList = [ ];
chrome.action.onClicked.addListener(async (tab) => { // 对当前tab执行操作
    // console.log("onClicked事件触发：", tab);
    if (tab.url.includes('chrome://') || tab.url.includes('chrome-extension://') || tab.url?.includes('edge://') ){
        console.log('can`t run on start page')
        return;
    }

    let nextState = await switchBadgeText(tab.id);

    // 切换后，执行相应操作：启用或关闭自定义样坏死
    if (nextState === ON) {
        // await on(tab);
        chrome.tabs.sendMessage(tab.id,{ action: 'addStyle' },{}, (response)=>{console.log("回信:",response)}); // 可插件间,tab间通讯.
        // chrome.runtime.sendMessage({},()=>{}); // 这种应该是所有tab都会收到消息吧.我们只需要切换当前tab的中的样式.

    } 
    if (nextState === OFF) {
        // await off(tab);
        chrome.tabs.sendMessage(tab.id,{ action: 'removeStyle' },{}, (response)=>{console.log("回信:",response)}); // 可插件间,tab间通讯.
    }

    // 用途： 点击插件按钮后，对当前页面执行一段内容脚本(可访问DOM)。
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func:modifyPage, // files:  ['content.js'],
    // });

});


// 在网页中执行的函数



async function setBadgeText(tabId,text){
    await chrome.action.setBadgeText({
        tabId: tabId,
        text: text,
    });
}
async function getBadgeText(tabId){
    return await chrome.action.getBadgeText({tabId: tabId,});
}
async function switchBadgeText(tabId){
    // 切换徽章状态
    const prevState = await getBadgeText(tabId);
    const nextState = prevState===ON ? OFF : ON;
    return await setBadgeText(tabId, nextState).then(()=>{
        return nextState;
    })
}


// 插入或删除样式: 缺点,只能手动添加和删除样式,无法在页面一加载就添加样式(在内容脚本中加),因为在tab内跳转新页面,只会触发上面的update事件,但它不合适,会触发任意多次.
async function insertCSS(tab){ // 还原样式
    return await chrome.scripting.insertCSS({
        files: ['custom-font.css'],
        target: { tabId: tab.id }
    });
}

async function removeCSS(tab){
    return await chrome.scripting.removeCSS({
        files: ['custom-font.css'],
        target: { tabId: tab.id }
    });
}



