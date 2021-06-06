function clickBtnSendMessage(){
    var msgbox = document.getElementById('msg')
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
    }).then((response)=> response.text()).then((resptext) =>{
      console.log('get response ', resptext)
      alert("get response : ", resptext)
    })
  }