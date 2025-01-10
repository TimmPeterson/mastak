import { map, user, room } from "./def.js";
import { frame } from "./game/draw.js";
import { eqto, point, field } from "./game/field.js";

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
  let mapField = new field(map, 1024, []);
  function startGame() {
    console.log("Игра началась!");
    window.location.href = "game.html";

    sendMessage("gameStarted", {
      userName: sessionStorage.getItem("userName"),
      roomName: sessionStorage.getItem("roomName"),
      map: mapField.walls,
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

  let mapFrame = new frame("mapCanvas");
  let canvas = document.getElementById("mapCanvas");
  mapField.draw(mapFrame);
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX =
      ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
    const mouseY =
      ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;
    const p = {
      x: Math.floor(mouseX / (mapField.boxsize + mapField.gapsize)),
      y: Math.floor(mouseY / (mapField.boxsize + mapField.gapsize)),
    };
    if (p.x == 0 || p.x == 15 || p.y == 0 || p.y == 15) return;
    const PY = [point(1, 1), point(13, 1), point(1, 13), point(13, 13)];
    const DX = [point(0, 0), point(1, 0), point(0, 1), point(1, 1)];
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++)
        if (eqto(p, point(PY[y].x + DX[x].x, PY[y].y + DX[x].y))) return;
    mapField.walls[p.y][p.x] = !mapField.walls[p.y][p.x];
    mapField.buildEdges();
    mapField.draw(mapFrame);
  });
});
