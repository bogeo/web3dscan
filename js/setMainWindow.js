function setMain(element) {
  var boxes = document.querySelectorAll(".boxes .box");
  for (var i = 0; i < boxes.length; i++) {
    var box = boxes[i];

    box.classList.add("box--side");
    box.classList.remove("box--main");
  }
  element.parentElement.classList.remove("box--side");
  element.parentElement.classList.add("box--main");
}

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}
