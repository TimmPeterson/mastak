export class ws {
  constructor(adress) {
    let protocol = location.protocol === "https:" ? "wss://" : "ws://";
    this.socket = new WebSocket(`${protocol}${location.host}`);

    window.socket = this.socket;

    // Обработка ошибок
    this.socket.addEventListener("error", (error) => {
      console.error("Ошибка вебсокета:", error);
    });
  }

  onopen(func) {
    // Обработка события открытия соединения
    this.socket.addEventListener(
      "open",
      (event) => func(event) //func(JSON.parse(event.data))
    );
  }

  onclose(func) {
    // Обработка события закрытия соединения
    this.socket.addEventListener("close", (event) =>
      func(JSON.parse(event.data))
    );
  }

  onmessage(func) {
    // Обработка получения сообщения
    socket.addEventListener("message", (event) => func(JSON.parse(event.data)));
  }

  // Пример функции для отправки сообщения на сервер
  send(type, message) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, message }));
    } else {
      console.error("Соединение не открыто");
    }
  }
}
