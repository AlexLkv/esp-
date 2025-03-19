const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {}; // { roomId: [ws1, ws2] }

app.use(express.static("public")); // Отдаём фронтенд

wss.on("connection", (ws) => {
    let roomId = null;

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "create") {
            roomId = uuidv4();
            rooms[roomId] = [ws];
            ws.send(JSON.stringify({ type: "room_created", roomId }));
        } else if (data.type === "join") {
            roomId = data.roomId;
            if (rooms[roomId] && rooms[roomId].length === 1) {
                rooms[roomId].push(ws);
                rooms[roomId].forEach(client => client.send(JSON.stringify({ type: "ready" })));
            } else {
                ws.send(JSON.stringify({ type: "error", message: "Комната заполнена или не найдена" }));
            }
        } else if (data.type === "signal") {
            if (rooms[roomId]) {
                rooms[roomId].forEach(client => {
                    if (client !== ws) client.send(JSON.stringify({ type: "signal" }));
                });
            }
        }
    });

    ws.on("close", () => {
        if (roomId && rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter(client => client !== ws);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        }
    });
});

server.listen(80, () => console.log("Сервер запущен на порту 80"));
