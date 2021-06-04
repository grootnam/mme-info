qnas = [
  {
      type : "career",
      title : "컴공dsadsadsadsadasads다른점",
      index : 5354
  },
  {
      type : "career",
      title : "컴dsa공이랑 우리과랑 다른점",
      index : 223232
  },
  {
      type : "class",
      title : "컴dasd공이랑 우리과랑 다른점",
      index : 213122
  },
  {
      type : "etc",
      title : "컴공dsadas이랑 우리과랑 다른점",
      index : 21322
  },
  {
      type : "class",
      title : "컴공이sadsa랑 우리과랑 다른점",
      index : 132232
  },    {
      type : "etc",
      title : "컴공dsad이랑 우리과랑 다른점",
      index : 12232
  }
]

window.onload = makePage


function makeCertainPage(categoryName){
  var container= document.getElementById('content_container')
  while(container.firstChild){
    container.removeChild(container.firstChild)
  }
  console.log('container cleared');
  for( i=0;i<qnas.length;i++){
    var element = qnas[i]
    if(element.type != categoryName){
      continue
    }
    var newone = document.createElement('span')
    newone.classList.add('content_'+element.type)
    var div=document.createElement('div')
    div.innerText="Q"
    div.classList.add('content_head', 'fontB')
    var a = document.createElement('a')
    a.classList.add('content_tail')
    a.innerHTML = element.title
    a.href=element.index

    newone.appendChild(div);
    newone.appendChild(a);
    container.appendChild(newone)
  };

  console.log('container populated', container.childNodes.length)
}

function makePage(){
  var container= document.getElementById('content_container')
  while(container.firstChild){
    container.removeChild(container.firstChild)
  }
  console.log('container cleared');
  qnas.forEach(element => {
    var newone = document.createElement('span')
    newone.classList.add('content_'+element.type)
    var div=document.createElement('div')
    div.innerText="Q"
    div.classList.add('content_head', 'fontB')
    var a = document.createElement('a')
    a.classList.add('content_tail')
    a.innerHTML = element.title
    a.href=element.index

    newone.appendChild(div);
    newone.appendChild(a);
    container.appendChild(newone)
  });
}

function openMenu(evt, menuName) {
 
  var i, x, tablinks, mainId, id, span;
  x = document.getElementsByClassName("menu");
  // for (i = 0; i < x.length; i++) {
  //   x[i].style.display = "none";
  // }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" gray_clicked", "");
  }
  document.getElementById(menuName).style.display = "block";
  evt.currentTarget.className += " gray_clicked";
}

function searchFunction(){
  var input, filter, id, span, a, txtValue;
    input = document.getElementById("search_bar");
    filter = input.value.toUpperCase();
    id = document.getElementById("content_container");
    span = id.getElementsByTagName("span");
    for (i = 0; i <span.length; i++) {
        a = span[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            span[i].style.display = "";
        } else {
            span[i].style.display = "none";
        }
    }
}