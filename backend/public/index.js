function clickBtnSendMessage(){
    var msgbox = document.getElementById('pushmsg')
    var msg=msgbox.value
    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-sendMessageStringOnly",{
      "method" : "POST",
      "mode": "no-cors", 
      "cache": "no-cache", 
      "credentials": "same-origin", 
      "headers": {
        "Content-Type": "application/json"
      },
      "body" : JSON.stringify({
        "message" : msg
      })
    }).then((response)=> response.json()).then((respjson) =>{
      console.log('get response ', respjson)
      alert("get response : ", respjson)
    })
  }


function clickBtnAdd(){
    var addName = document.getElementById('addName').value
    var addMonthFrom = document.getElementById('addMonthFrom').value
    var addMonthTo = document.getElementById('addMonthTo').value
    var startDate=new Date(addMonthFrom)
    var endDate=new Date(addMonthTo)
    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-postData",{
      "method" : "POST",
      "mode": "no-cors", 
      "cache": "no-cache", 
      "credentials": "same-origin", 
      "headers": {
        "Content-Type": "application/json"
      },
      "body" : JSON.stringify({
        "type" : "schedule",
        "data":{
            "start" : startDate,
            "end" : endDate,
            "name" : addName,
            "isenabled":true
        }
      })
    }).then((response)=> {
        console.log('response : ', response)
        return response.json()
    }).then((respjson) =>{
      console.log('get response ', respjson)
      alert("get response : ", respjson)
    })
}

function clickBtnSearch(){
    var searchYear=document.getElementById('searchYear').value
    var searchMonth = document.getElementById('searchMonth').value
    if(searchMonth.length == 1){
        searchMonth = "0"+searchMonth
    }
    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-getSchedulesByMonth/?year="+searchYear+"&month="+searchMonth).then((response)=> {
        console.log('response : ', response)
        return response.json()
    }).then((datas) =>{
      console.log('get response ', datas)
      var schedule_list=document.getElementById('schedule_list')
      while(schedule_list.hasChildNodes()){
          schedule_list.removeChild(schedule_list.firstChild)
      }
      datas.forEach(element => {
          var nd=document.createElement('div')
          var from = new Date(element.start._seconds*1000)
          var name=element.name
          var to = new Date(element.end._seconds*1000)
          var isEnabled = element.isenabled

          var text=`${name}, ${from.toUTCString()} ~ ${to.toUTCString()}, ${Boolean(isEnabled) == true ? '사용중' : '사용X'}`
          var btn=document.createElement('button')
          btn.onclick = function(){
              changeScheduleMode(element)
          }
          btn.innerText="사용여부 변경"
          nd.innerText=text
          nd.appendChild(btn)
          schedule_list.appendChild(nd)
      });
    })
}

function changeScheduleMode(element){
    console.log('my element : ',element)
    var isEnabled = element.isenabled
    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-editData",{
      "method" : "POST",
      "mode" : "no-cors",
      "cache": "no-cache", 
      "credentials": "same-origin", 
      "headers": {
        "Content-Type": "application/json"
      },
      "body" : JSON.stringify({
        "type" : "schedule",
        "index" : element.index,
        "data":{
            "isenabled":!isEnabled
        }
      })
    }).then((response)=> {
        console.log('response : ', response)
        return response.json()
    }).then((respjson) =>{
      console.log('get response ', respjson)
      clickBtnSearch()
    }, (reason)=>{
        console.log('get response json failed ', reason)
        clickBtnSearch()
    })
}