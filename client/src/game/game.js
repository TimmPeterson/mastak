import { frame } from "./draw.js";
import { field } from "./field.js";
import { ws } from "./ws.js";

function addMember(name) {
  const memberList = document.getElementById("memberList");
  const listItem = document.createElement("li");
  listItem.textContent = name;
  memberList.appendChild(listItem);
}

function delMember(name) {
  const memberList = document.getElementById("memberList");
  const items = memberList.getElementsByTagName("li");
  for (let i = 0; i < items.length; i++) {
    if (items[i].textContent === name) {
      memberList.removeChild(items[i]);
      break;
    }
  }
}

function addAction(text) {
  const actionList = document.getElementById("actionList");
  const listItem = document.createElement("li");
  listItem.textContent = text;
  actionList.appendChild(listItem);
}

// // Пример использования функций
// addMember("Игрок 1");
// addAction("Игрок 1 присоединился к игре.");
// addMember("Игрок 2");
// addAction("Игрок 2 присоединился к игре.");
// delMember("Игрок 1");
// addAction("Игрок 1 вышел из игры.");

let header = document.getElementById("header");
let gameFrame = new frame("gameCanvas");
//gameFrame.putRect(100, 20, 100, 20, 0, 0, 0);
//console.log("done");

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
// let gameField = field.fromJSON(
//   JSON.stringify(
//     new field(map, 1024, [
//       { x: 5, y: 13 },
//       { x: 14, y: 3 },
//       { x: 14, y: 12 },
//     ])
//   )
// );

// gameField.draw(gameFrame);
// // gameField.drawEdge(gameFrame, 3, 4, 4, 5, 0);
// // gameField.drawEdge(gameFrame, 1, 1, 2, 1, 0);
// // gameField.drawEdge(gameFrame, 2, 3, 3, 3, 0);

// for (let t = 0; t < 10; t++) {
//   await gameField.go(gameFrame);
//   await gameField.go(gameFrame);
//   await gameField.go(gameFrame);
// }

let socket = new ws(`wss://` + location.host);

let gameField;
let playerNo = -1;

socket.onopen((msg) => {
  socket.send("askPlayerNo", {
    userName: sessionStorage.getItem("userName"),
    roomName: sessionStorage.getItem("roomName"),
  });
});

// На сервере нужно обработать сообщения:
// >>> "askPlayerNo":
//     - генерирует перестановку числе (n = колво учатсников комнаты)
//     - по индексу пользователя в списке учатсников комнаты возвращает номер в перестановке
//     - также возвращает инициализированное поле
//     - отправляет этому пользователю сообщение "ansPlayerNo"
//
// >>> "turnDone":
//     - перенаправляет это сообщение всем пользователям
//

socket.onmessage(async (msg) => {
  if (msg.type == "ansPlayerNo") {
    playerNo = msg.playerNo;
    gameField = field.fromJSON(msg.gameField);
    gameField.draw(gameFrame);

    if (playerNo == gameField.turn) {
      header.innerText = "Your turn";
      await gameField.go(gameFrame, socket);
      socket.send("turnDone", {
        userName: sessionStorage.getItem("userName"),
        roomName: sessionStorage.getItem("roomName"),
        gameField: gameField,
        playerNo: playerNo,
      });
      //header.innerText = "Wait for your turn";
    }
  }

  if (msg.type == "turnDone") {
    if (msg.roomName == sessionStorage.getItem("roomName")) {
      gameField = field.fromJSON(msg.gameField);
      gameField.draw(gameFrame);

      if (playerNo == gameField.turn) {
        header.innerText = "Your turn";
        await gameField.go(gameFrame, socket);
        socket.send("turnDone", {
          userName: sessionStorage.getItem("userName"),
          roomName: sessionStorage.getItem("roomName"),
          gameField: gameField,
          playerNo: playerNo,
        });
        //header.innerText = "Wait for your turn";
      }
    }
  }

  if (msg.type == "gameEnded") {
    if (msg.roomName == sessionStorage.getItem("roomName")) {
      alert(`${msg.userName} has won the game!`);
      if (sessionStorage.getItem("isadmin") === "true")
        window.location.href = "admin_room.html";
      else window.location.href = "member_room.html";
    }
  }
});
