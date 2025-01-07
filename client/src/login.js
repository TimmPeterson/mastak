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
});

// Обработка события получения сообщения от сервера
socket.addEventListener("message", (event) => {
  console.log("Сообщение от сервера:", event.data);
  // Вы можете здесь обработать полученные данные
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

/*** ****/

document.getElementById("confirmButton").addEventListener("click", function () {
  const inputValue = document.getElementById("inputField").value;

  // Вы можете сделать что-то с inputValue, если это необходимо

  // После нажатия кнопки переход на другую страницу:
  if (inputValue != "") {
    sendMessage("newUser", new user(inputValue, undefined));
    sessionStorage.setItem("userName", inputValue);
    window.location.href = "choose_action.html";
  } else alert("Поле ввода никнейма не должно быть пустым");
});
