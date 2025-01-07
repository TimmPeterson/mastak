function createAction() {
  window.location.href = "choose_room_title.html";
  console.log("Create button clicked!");
}

function joinAction() {
  window.location.href = "choose_room_menu.html";
  console.log("Join button clicked!");
}

function goBackAction() {
  window.location.href = "index.html";
  console.log("Go back button clicked!");
}

// Привязка функций к кнопкам
userName = sessionStorage.getItem("userName");
console.log(userName);

document.getElementById("createButton").addEventListener("click", createAction);
document.getElementById("joinButton").addEventListener("click", joinAction);
document.getElementById("backButton").addEventListener("click", goBackAction);

document.getElementById("hUserName").textContent = userName;
