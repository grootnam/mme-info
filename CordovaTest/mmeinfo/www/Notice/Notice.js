// window.onload=makeNoticePage()
$(document).delegate('.ui-page', 'pageshow', function () {
    makeNoticePage()
});
 function makeNoticePage(){
     var cur=localStorage.getItem("selectedNotice")
     if(cur.length<=0){
         console.log('notice not selected')
         return
     }
     var obj= JSON.parse(cur)
     if(!obj){
         console.log('obj unparsable : ',cur)
         return;
     }
     
     var title=document.getElementById('title')
     var content = document.getElementById('content')
     var link=document.getElementById('link')
     title.innerText=""
     content.innerText=""
     link.innerText=""
     link.href=""

     title.innerText=obj["title"]
     content.innerText=obj["content"]

     if(obj["link"]){
         link.innerText=obj["link"]
         link.href=obj["link"]
     }
 }