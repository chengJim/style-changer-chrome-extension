


Content scripts:

  run in the context of web pages. By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension.

  参考: https://developer.chrome.com/docs/extensions/mv3/content_scripts/#functionality


Injects CSS into a page

  chrome.tabs.insertCSS(
    tabId?: number,
    details: InjectDetails,
    callback?: function,
  )

API文档：https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onCreated
常用API：
chrome.storage.local
  Persist data rather than using global variables














