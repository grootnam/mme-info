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
            "name" : addName
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
    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-getSchedulesByMonth/?year="+searchYear+"-"+searchMonth,{
      "method" : "GET",
      "mode": "no-cors", 
      "cache": "no-cache", 
      "credentials": "same-origin"
    }).then((response)=> {
        console.log('response : ', response)
        return response.json()
    }).then((respjson) =>{
      console.log('get response ', respjson)
      //alert("get response : ", respjson)
    })
}

function changeScheduleMode(schedule){

}