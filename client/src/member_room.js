import { user, room } from "./def.js";

sessionStorage.setItem("isadmin", "false");
document.getElementById("hRoomName").textContent =
  sessionStorage.getItem("roomName");

// Создание нового WebSocket подключения
let protocol = location.protocol === "https:" ? "wss://" : "ws://";
let socket = new WebSocket(`${protocol}${location.host}`);
window.socket = socket;

// Обработка события открытия соединения
socket.addEventListener("open", (event) => {
  console.log("Соединение установлено");
  // Вы можете отправить сообщение на сервер сразу после установления соединения
  //socket.send(JSON.stringify({ type: "greeting", message: "Привет, сервер!" }));
  sendMessage("askMembersList", {
    userName: sessionStorage.getItem("userName"),
    roomName: sessionStorage.getItem("roomName"),
  });
});

// Обработка события закрытия соединения
socket.addEventListener("close", (event) => {
  console.log("Соединение закрыто", event);
});

// Обработка ошибок
socket.addEventListener("error", (error) => {
  console.error("Ошибка вебсокета:", error);
});

// Пример функции для отправки сообщения на сервер
function sendMessage(type, message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, message }));
  } else {
    console.error("Соединение не открыто");
  }
}

/*** ***/

document.addEventListener("DOMContentLoaded", function () {
  const quitButton = document.getElementById("quitButton");

  quitButton.addEventListener("click", quitRoom);

  // Функция-пустышка для нажатия на кнопку Quit
  function quitRoom() {
    sendMessage("userQuitRoom", {
      userName: sessionStorage.getItem("userName"),
      roomName: sessionStorage.getItem("roomName"),
    });
    window.location.href = "choose_action.html";
  }

  //////////////////

  // Функция для добавления участника
  function addMember(memberName, callBack) {
    const memberDiv = document.createElement("div");
    memberDiv.className = "member";
    if (memberName == sessionStorage.getItem("userName"))
      memberDiv.innerHTML = memberName + " <i><b>(you)</b></i>";
    else memberDiv.innerText = memberName;

    // Добавляем обработчик клика
    memberDiv.onclick = () => {
      callBack(memberName);
    };

    membersList.appendChild(memberDiv);
  }

  // Функция для удаления участника
  function delMember(memberName) {
    const members = document.querySelectorAll(".member");
    members.forEach((member) => {
      if (member.innerText === memberName) {
        membersList.removeChild(member);
      }
    });
  }

  function delAllMembers() {
    const members = document.querySelectorAll(".member");
    members.forEach((member) => {
      membersList.removeChild(member);
    });
  }

  /////////////////////////

  socket.addEventListener("message", (event) => {
    let msg = JSON.parse(event.data);
    console.log("Сообщение от сервера:", msg);

    if (msg.type == "ansMembersList") {
      delAllMembers();
      msg.membersList.forEach((member) => {
        addMember(member.name, (name) => {
          console.log(name);
        });
      });
    }

    if (
      msg.type == "roomClosed" &&
      msg.roomName == sessionStorage.getItem("roomName")
    ) {
      alert("Host has closed the room");
      window.location.href = "choose_action.html";
    }

    if (
      msg.type == "gameStarted" &&
      msg.roomName == sessionStorage.getItem("roomName")
    ) {
      window.location.href = "game.html";
      alert("Host has started the game");
    }
  });

  document
    .getElementById("refreshButton")
    .addEventListener("click", (event) => {
      sendMessage("askMembersList", {
        userName: sessionStorage.getItem("userName"),
        roomName: sessionStorage.getItem("roomName"),
      });
    });

  //   addMember("Alekseyev Amir", () => {});
  //   addMember("Amalia", () => {});
});
