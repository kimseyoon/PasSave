// content page, popup page로 나뉜다

let currentHref = "";
chrome.tabs.executeScript({
  code:'location.href'
},function(result){
  currentHref = result[0];
  chrome.storage.sync.get(function(data){
    let {loginInfo} = data;
    let currentLoginInfo = loginInfo.filter(function(item, index){
      if(item.href === currentHref){
        return item;
      }
    })

    if(currentLoginInfo.length === 0){
      let eleLoginRegister = document.querySelector(".loginRegister");
      eleLoginRegister.classList.add("select");
    }else{
      let eleLoginInfo = document.querySelector(".loginInfo");
      eleLoginInfo.classList.add("select");

      let str = "";
      let loginInfoList = document.querySelector(".loginInfoList");
      currentLoginInfo.forEach(function(item, index){
        str += "<li class='infoData' data-id="+item.id+"><p>Website : <span>"+item.website+"</span></p><p>ID : <span>"+item.web_id+"</span></p><p>PW : <span>"+item.web_password+"</span></p><button type='button' name='button' class='btnDelInfo'>삭제</button></li>"
      })
      loginInfoList.innerHTML = str;
    }
  })
})

function toggleContent(selectedContent){
  let eleContents = document.querySelectorAll(".content");
  let arrContents = [...eleContents];
  arrContents.forEach(function(item){
    item.classList.remove("select");
  })
  let eleSelectedContent = document.querySelector(selectedContent);
  eleSelectedContent.classList.add("select");
}

function setBadge(){
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

document.addEventListener("click", function(e){
  let target = e.target;
  if(target.id === "registerBtn"){
    let website = document.querySelector("#website").value;
    let web_id = document.querySelector("#web_id").value;
    let web_password = document.querySelector("#web_password").value;

    if(website === "" && web_id === "" && web_password === ""){
      chrome.notifications.create("notFindLoginInfo", {
        type : "basic",
        iconUrl : "wanning.png",
        title : "알림창",
        message : "별명, 아이디, 비밀번호 중 적어도 한개를 입력해주세요."
      });
      return;
    }

    chrome.storage.sync.get(function(data){
      let {loginInfo} = data;
      let data_id = loginInfo.length;
      loginInfo.push({id : data_id, href:currentHref, website:website, web_id:web_id, web_password:web_password});
      chrome.storage.sync.set({
        loginInfo : loginInfo
      }, function(){
        let loginInfoList = document.querySelector(".loginInfoList");
        loginInfoList.insertAdjacentHTML('beforeend', "<li class='infoData' data-id ="+data_id+"><p>Website : <span>"+website+"</span></p><p>ID : <span>"+web_id+"</span></p><p>PW : <span>"+web_password+"</span></p><button type='button' class='btnDelInfo' name='button'>삭제</button></li>");
        toggleContent(".loginInfo");
        document.querySelector("#website").value = "";
        document.querySelector("#web_id").value = "";
        document.querySelector("#web_password").value = "";
        setBadge();
      })
    })
  }

  else if(target.id === "addBtn"){
    toggleContent(".loginRegister");
  }

  else if(target.id === "backToInfoBtn"){
    chrome.storage.sync.get(function(data){
      let {loginInfo} = data;
      let currentLoginInfo = loginInfo.filter(function(item, index){
        if(item.href === currentHref){
          return item;
        }
      })

      if(currentLoginInfo.length === 0){
        chrome.notifications.create("notFindLoginInfo", {
          type : "basic",
          iconUrl : "wanning.png",
          title : "알림창",
          message : "등록된 로그인 정보가 없습니다."
        });
        return;
      }else{
        toggleContent(".loginInfo");
      }
    })
  }

  else if(target.classList.contains("btnDelInfo")){
    let infoDataId = parseInt(target.closest(".infoData").getAttribute("data-id"));
    chrome.storage.sync.get(function(data){
      let {loginInfo} = data;
      let temp = 0;
      loginInfo.forEach(function(item, index){
        if(item.id === infoDataId){
          temp = index;
        }
      })
      loginInfo.splice(temp, 1);
      chrome.storage.sync.set({
        loginInfo : loginInfo
      }, function(){
        let eleLoginInfoList = document.querySelector(".loginInfoList");
        eleLoginInfoList.removeChild(target.closest(".infoData"));
        chrome.storage.sync.get(function(data){
          let {loginInfo} = data;
          setBadge();
          let currentLoginInfo = loginInfo.filter(function(item, index){
            if(item.href === currentHref){
              return item;
            }
          })
          if(currentLoginInfo.length === 0){
            toggleContent(".loginRegister");
          }
        })
      })
    })
  }
})
