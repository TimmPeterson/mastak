import { genOrder, genCommonField } from "./utils.mjs";
import http from "node:http";
import { WebSocketServer } from "ws";
import express from "express";
// const utils = require("./utils");
// let genOrder = utils.genOrder;
// let genCommonField = utils.genCommonField;
//const express = require("express");
//const http = require("http");
//const WebSocket = require("ws");

// Создаем экземпляр express
const app = express();

// Создаем HTTP сервер и связываем его с express
const server = http.createServer(app);

// Создаем экземпляр WebSocket сервера
const wss = new WebSocketServer({ server });

// Устанавливаем статический маршрут для отдачи HTML
app.use(express.static("client"));

/*** Основные типы данных для представления данных о пользователях и комнатах ***/

// Тип представляющий одного пользователя
class user {
  constructor(name, meta) {
    this.name = name;
    this.meta = meta;
  }
}

// Тип представляющий одну комнату
class room {
  constructor(title, admin, meta) {
    this.title = title;
    this.admin = admin;
    this.meta = meta;
    this.membersList = [admin];
    this.addMember = (newMember) => {
      this.membersList.push(newMember);
    };
  }
}

/*** Данные которые хранит сервер о пользователях и комнатах ***/
let usersList = []; // Список всех пользователей
let roomsList = []; // Спислк всех открытых комнат

/*** список всех открытых сокетов ***/
let socketList = [];

// Обработка подключения WebSocket
wss.on("connection", (ws) => {
  console.log("New client connected");

  socketList.push(ws);

  // Отправляем сообщение клиенту
  ws.send(
    JSON.stringify({ type: "text", text: "Welcome to the WebSocket server!" })
  );

  // Обработка сообщений от клиента
  ws.on("message", (message) => {
    let msg = JSON.parse(message);
    console.log("Received:", msg);

    if (msg.type == "newUser") {
      if (!usersList.some((user) => user.name == msg.message.name)) {
        usersList.push(new user(msg.message.name, msg.message.meta));
      }
      console.log(usersList);
    }

    if (msg.type == "newRoom") {
      roomsList.push(
        new room(msg.message.title, msg.message.admin, msg.message.meta)
      );
      console.log(roomsList);
    }

    if (msg.type == "askRoomsList") {
      ws.send(JSON.stringify({ type: "ansRoomsList", roomsList: roomsList }));
    }

    if (msg.type == "userJoinRoom") {
      roomsList.forEach((room) => {
        if (room.title == msg.message.roomName) {
          room.membersList.push(new user(msg.message.userName, undefined));
        }
      });
    }

    if (msg.type == "userQuitRoom") {
      roomsList.forEach((room) => {
        if (room.title == msg.message.roomName) {
          room.membersList = room.membersList.filter(
            (user) => user.name !== msg.message.userName
          );
        }
      });
    }

    if (msg.type == "askMembersList") {
      roomsList.forEach((room) => {
        if (room.title == msg.message.roomName) {
          ws.send(
            JSON.stringify({
              type: "ansMembersList",
              membersList: room.membersList,
            })
          );
        }
      });
    }

    if (msg.type == "roomClosed") {
      roomsList = roomsList.filter(
        (room) => room.title !== msg.message.roomName
      );
      socketList.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: "roomClosed",
            userName: msg.message.userName,
            roomName: msg.message.roomName,
          })
        );
      });
    }

    if (msg.type == "gameStarted") {
      socketList.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: "gameStarted",
            userName: msg.message.userName,
            roomName: msg.message.roomName,
          })
        );
      });
    }

    // Play Time
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

    if (msg.type == "askPlayerNo") {
      for (let rm of roomsList) {
        if (rm.title == msg.message.roomName) {
          if (rm.order == undefined) {
            rm.order = genOrder(rm.membersList.length);
          }
          let index = 0;
          for (let i in rm.membersList) {
            if (rm.membersList[i].name == msg.message.userName) {
              index = i;
              break;
            }
          }
          let playerNo = rm.order[index];

          if (rm.gameField == undefined) {
            rm.gameField = genCommonField(rm.membersList.length);
          }

          ws.send(
            JSON.stringify({
              type: "ansPlayerNo",
              playerNo: playerNo,
              gameField: rm.gameField,
            })
          );
        }
      }
    }

    if (msg.type == "turnDone") {
      for (let rm of roomsList) {
        if (rm.title == msg.message.roomName) {
          rm.gameField = msg.message.gameField;
          break;
        }
      }
      let newmsg = msg.message;
      newmsg.type = msg.type;
      socketList.forEach((socket) => {
        socket.send(JSON.stringify(newmsg));
      });
    }

    if (msg.type == "gameEnded") {
      for (let rm of roomsList) {
        if (rm.title == msg.message.roomName) {
          rm.gameField = undefined;
          rm.order = undefined;
          break;
        }
      }
      socketList.forEach((socket) => {
        socket.send(
          JSON.stringify({
            type: "gameEnded",
            userName: msg.message.userName,
            roomName: msg.message.roomName,
          })
        );
      });
    }
  });

  // Обработка отключения клиента
  ws.on("close", () => {
    socketList.slice(socketList.indexOf(ws), 1);
    console.log("Client disconnected");
  });
});

// Запускаем сервер
const PORT = 8081;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
