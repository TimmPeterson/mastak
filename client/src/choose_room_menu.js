import { user, room } from "./def.js";

// Создание нового WebSocket подключения
let protocol = location.protocol === "https:" ? "wss://" : "ws://";
let socket = new WebSocket(`${protocol}${location.host}`);
window.socket = socket;

// Обработка события открытия соединения
socket.addEventListener("open", (event) => {
  console.log("Соединение установлено");
  // Вы можете отправить сообщение на сервер сразу после установления соединения
  socket.send(JSON.stringify({ type: "greeting", message: "Привет, сервер!" }));
  sendMessage("askRoomsList", { userName: sessionStorage.getItem("userName") });
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

const roomList = document.getElementById("roomList");

function goBackAction() {
  window.location.href = "choose_action.html";
  console.log("Go back button clicked!");
}

document.getElementById("backButton").addEventListener("click", goBackAction);

// Функция для добавления комнаты
function addRoom(roomName, callBack) {
  const roomDiv = document.createElement("div");
  roomDiv.className = "room";
  roomDiv.innerText = roomName;

  // Добавляем обработчик клика
  roomDiv.onclick = () => {
    callBack(roomName);
  };

  roomList.appendChild(roomDiv);
}

// Функция для удаления комнаты
function delRoom(roomName) {
  const rooms = document.querySelectorAll(".room");
  rooms.forEach((room) => {
    if (room.innerText === roomName) {
      roomList.removeChild(room);
    }
  });
}

function delAllRooms() {
  const rooms = document.querySelectorAll(".room");
  rooms.forEach((room) => {
    roomList.removeChild(room);
  });
}

// // Пример использования
// const addButton = document.getElementById("addButton");

// // Обработчик для добавления комнат при нажатии на кнопку (для теста)
// addButton.addEventListener("click", () => {
//   const roomName = prompt("Введите название комнаты:");
//   if (roomName) {
//     addRoom(roomName, (name) => {
//       alert(`Вы присоединились к комнате: ${name}`);
//     });
//   }
// });

// // Пример удаления комнаты (для теста)
// setTimeout(() => {
//   delRoom("Пример комнаты"); // Удалим пример комнаты, если такая будет
// }, 5000); // Задержка для демонстрации удаления комнаты

// addRoom("Anaros's Room", (name) => {
//   console.log(`Hello from room "${name}"`);
//   window.location.href = "member_room.html";
// });

// addRoom("TimPeterson's Room", (name) => {
//   console.log(`Hello from room "${name}"`);
//   window.location.href = "member_room.html";
// });

// addRoom("Satero's Room", (name) => {
//   console.log(`Hello from room "${name}"`);
//   window.location.href = "member_room.html";
// });

// for (let i = 0; i < 15; i++)
//   addRoom(`TimPeterson's Room #${i + 1}`, (name) => {
//     console.log(`Hello from room "${name}"`);
//     window.location.href = "member_room.html";
//   });

// Обработка события получения сообщения от сервера
socket.addEventListener("message", (event) => {
  console.log("Сообщение от сервера:", event.data);
  let msg = JSON.parse(event.data);

  if (msg.type == "ansRoomsList") {
    delAllRooms();
    msg.roomsList.forEach((room) => {
      addRoom(room.title, (title) => {
        sessionStorage.setItem("roomName", title);

        sendMessage("userJoinRoom", {
          userName: sessionStorage.getItem("userName"),
          roomName: title,
        });

        window.location.href = "member_room.html";
      });
    });
  }
  // Вы можете здесь обработать полученные данные
});

document.getElementById("refreshButton").addEventListener("click", () => {
  sendMessage("askRoomsList", { userName: sessionStorage.getItem("userName") });
});
