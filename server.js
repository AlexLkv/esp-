const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Раздаём статические файлы из папки public
app.use(express.static('public'));

// Создаём комнату для пользователей (например, "room1")
io.on('connection', socket => {
  console.log('Подключён пользователь:', socket.id);
  socket.join('room1');

  // Получаем событие нажатия кнопки от одного из клиентов
  socket.on('buttonPress', () => {
    console.log(`Кнопка нажата пользователем ${socket.id}`);
    // Отправляем команду другому пользователю в комнате
    socket.to('room1').emit('toggleLED');
  });
});

const PORT = process.env.PORT || 80;
http.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
