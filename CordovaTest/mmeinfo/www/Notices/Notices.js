// notices = [
//   {
//       type : "campus",
//       title : "2021학년도 2학기 복수(연계) 전공 신청",
//       index : 2232
//   },
//   {
//       type : "engineering",
//       title : "공과대학 캡스톤 디자인 대회",
//       index : 223232
//   },
//   {
//       type : "office",
//       title : "졸업 이수 학점 안내",
//       index : 213122
//   },
//   {
//       type : "student",
//       title : "사물함 신청 날짜",
//       index : 21322
//   },
//   {
//       type : "campus",
//       title : "졸업 사진 촬영 안내",
//       index : 132232
//   },    {
//       type : "engineering",
//       title : "공과대학 MSC 공학인증 학점 변경 안내",
//       index : 12232
//   }
// ]

notices = [];

window.onload = makePage;

function makeCertainPage(categoryName) {
  var container = document.getElementById("content_container");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  console.log("container cleared");
  notices.forEach((element) => {
    if(element.type != categoryName){
      return
    }
    var newone = document.createElement("span");
    newone.classList.add("content_" + element.type);
    var div = document.createElement("div");
    div.innerText = "●";
    div.classList.add("content_head");
    var a = document.createElement("a");
    a.classList.add("content_tail");
    a.innerHTML = element.title;
    a.onclick = function () {
      var cur = element;
      console.log("cur object : ", cur);
      localStorage.setItem("selectedNotice", JSON.stringify(cur));
      window.location.href = "../Notice/Notice.html";
    };

    newone.appendChild(div);
    newone.appendChild(a);
    container.appendChild(newone);
  });
  console.log("container populated", container.childNodes.length);

}

function makePage() {
  var container = document.getElementById("content_container");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  console.log("container cleared");
  fetch(
    "https://us-central1-mme-info.cloudfunctions.net/apis-getDatasByIndexs?type=notice&from=0&to=100"
  )
    .then((response) => response.json())
    .then((datas) => {
      notices = [];
      datas.forEach((element) => {
        notices.push({
          type: element["category"],
          title: element["title"],
          content: element["content"],
          link: element["link"],
        });
      });
      notices.forEach((element) => {
        var newone = document.createElement("span");
        newone.classList.add("content_" + element.type);
        var div = document.createElement("div");
        div.innerText = "●";
        div.classList.add("content_head");
        var a = document.createElement("a");
        a.classList.add("content_tail");
        a.innerHTML = element.title;
        a.onclick = function () {
          var cur = element;
          console.log("cur object : ", cur);
          localStorage.setItem("selectedNotice", JSON.stringify(cur));
          window.location.href = "../Notice/Notice.html";
        };

        newone.appendChild(div);
        newone.appendChild(a);
        container.appendChild(newone);
      });
    });
}

function openMenu(evt, menuName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("menu");
  //for (i = 0; i < x.length; i++) {
  //  x[i].style.display = "none";
  //}
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" gray_clicked", "");
  }
  document.getElementById(menuName).style.display = "block";
  evt.currentTarget.className += " gray_clicked";
}

function searchFunction() {
  var input, filter, id, span, a, txtValue;
  input = document.getElementById("search_bar");
  filter = input.value.toUpperCase();
  id = document.getElementById("content_container");
  span = id.getElementsByTagName("span");
  for (i = 0; i < span.length; i++) {
    a = span[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      span[i].style.display = "";
    } else {
      span[i].style.display = "none";
    }
  }
}
