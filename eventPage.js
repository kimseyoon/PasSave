//chrome://inspect/#extensions debbuger
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete'){
    chrome.tabs.getSelected(null, function(tab) {
      let currentUrl = tab.url;
      chrome.storage.sync.get(function(data){
        let {loginInfo} = data;
        let currentLoginInfo = loginInfo.filter(function(item, index){
          if(item.href === currentUrl){
            return item;
          }
        })
        let currentLoginInfoLength = currentLoginInfo.length.toString();
        chrome.browserAction.setBadgeText({"text" : currentLoginInfoLength});
      })
    });
  }
});
