function openMenu(evt, menuName) {
  var i, x, tablinks, mainId, id, span;
  x = document.getElementsByClassName("menu");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
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

function sort(menuName){
  var mainId, id, span;
  mainId = document.getElementById("All");//All
  id = mainId.getElementById("content_container");//content_container
  span = id.getElementsByTagName("span");//content_*
  for(i=0; i<span.length; i++){
    if(menuName == span[i].className){
      span[i].style.display ="";
    } else{
      span[i].style.display = "none";
    }
  }
}