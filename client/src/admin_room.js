import { user, room } from "./def.js";

sessionStorage.setItem("isadmin", "true");
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
  const startButton = document.getElementById("startButton");
  const closeButton = document.getElementById("closeButton");

  startButton.addEventListener("click", startGame);
  closeButton.addEventListener("click", closeRoom);

  // Функция-пустышка для нажатия на кнопку Start
  function startGame() {
    console.log("Игра началась!");
    window.location.href = "game.html";

    sendMessage("gameStarted", {
      userName: sessionStorage.getItem("userName"),
      roomName: sessionStorage.getItem("roomName"),
    });
  }

  // Функция-пустышка для нажатия на кнопку Close
  function closeRoom() {
    console.log("Комната закрыта!");
    sendMessage("roomClosed", {
      userName: sessionStorage.getItem("userName"),
      roomName: sessionStorage.getItem("roomName"),
    });
    window.location.href = "choose_action.html";
  }

  const membersList = document.getElementById("membersList");

  //////////////////

  // Функция для добавления участника
  function addMember(memberName, callBack) {
    const memberDiv = document.createElement("div");
    memberDiv.className = "member";
    memberDiv.innerText = memberName;

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

  // Обработка события получения сообщения от сервера
  socket.addEventListener("message", (event) => {
    let msg = JSON.parse(event.data);
    console.log("Сообщение от сервера:", msg);

    // if (msg.room == sessionStorage.getItem("roomName")) {
    //   if (msg.type == "newMember") {
    //     window.addMember(msg.message.name);
    //   }
    //   if (msg.type == "userLeft") {
    //     window.delMember(msg.message.name);
    //   }
    // }

    if (msg.type == "ansMembersList") {
      delAllMembers();
      msg.membersList.forEach((member) => {
        addMember(member.name, (name) => {
          console.log(name);
        });
      });
    }
    // Вы можете здесь обработать полученные данные
  });

  document
    .getElementById("refreshButton")
    .addEventListener("click", (event) => {
      sendMessage("askMembersList", {
        userName: sessionStorage.getItem("userName"),
        roomName: sessionStorage.getItem("roomName"),
      });
    });
  //   setTimeout(() => {
  //     sendMessage("askMembers", {
  //       userName: sessionStorage.getItem("userName"),
  //       roomName: sessionStorage.getItem("roomName"),
  //     });
  //   }, 1000);

  //window.addMember("Anaros");
  //window.addMember("TimPeterson");
  //for (let i = 0; i < 15; i++) window.addMember(`TimPeterson #${i + 1}`);
});
