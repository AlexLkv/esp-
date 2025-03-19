const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
    if (clients.length < 2) {
        clients.push(ws);
        console.log("Новое устройство подключено");

        ws.on("message", (message) => {
            console.log(`Получено сообщение: ${message}`);
            clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on("close", () => {
            console.log("Устройство отключено");
            clients = clients.filter((client) => client !== ws);
        });
    } else {
        ws.close();
        console.log("Отклонено подключение, комната заполнена");
    }
});

app.use(cors());
app.get("/", (req, res) => {
    res.send("Сервер работает");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
