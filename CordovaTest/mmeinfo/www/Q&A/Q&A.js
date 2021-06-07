
$(document).delegate(".ui-page", "pageshow", function () {
  makeQnaPage();
});

currentObj=undefined
function sendComment(){
    var comment=document.getElementById("comment").value
    if(comment.length<=0){
        confirm("댓글은 1자 이상 작성해주십시오.")
    }

    fetch("https://us-central1-mme-info.cloudfunctions.net/apis-postData",{
        "method" : "POST",
      "mode": "no-cors", 
      "cache": "no-cache", 
      "credentials": "same-origin", 
      "headers": {
        "Content-Type": "application/json"
      },
        "body" : JSON.stringify({
          "type" : "comment",
          "data" :{
              "text" : comment,
              "comment_index" : Number(currentObj["index"]),
              "comment_type" : "qna"
          }
        })
      }).then((response)=>{
          makeQnaPage()
      })
}

function makeQnaPage() {
  var cur = localStorage.getItem("selectedQnA");
  if (cur.length <= 0) {
    console.log("qna not selected");
    return;
  }
  var obj = JSON.parse(cur);
  if (!obj) {
    console.log("obj unparsable : ", cur);
    return;
  }

  currentObj=obj

  var title = document.getElementById("title");
  var content = document.getElementById("content");
  var comment_container=document.getElementById("comment_container")


  title.innerText = "";
  content.innerText = "";

  title.innerText = obj["title"];
  content.innerText = obj["content"];

  while(comment_container.firstChild){
    comment_container.removeChild(comment_container.firstChild)
    }
  var idx = obj["index"];

  fetch(
    "https://us-central1-mme-info.cloudfunctions.net/apis-getCommentsByTypeAndIndex?type=qna&index=" +
      idx
  )
    .then((response) => response.json())
    .then((datas) => {
        var qna_comment = [];
        datas.forEach(element => {
            qna_comment.push({
                index : Number(element["index"]),
                text : element["text"]
            })
        });
        qna_comment = qna_comment.sort((a,b)=>{
            return a["index"] - b["index"]
        })

        qna_comment.forEach((element)=>{
            var span = document.createElement("span");
            var div1= document.createElement("div")
            var div2=document.createElement("div")
            span.classList.add("comment")
            div1.classList.add("comment_head")
            div2.classList.add("comment_tail")
            div1.innerText="A"
            div2.innerText=element["text"]
            span.appendChild(div1)
            span.appendChild(div2)
            comment_container.appendChild(span)
        })
    });
}
