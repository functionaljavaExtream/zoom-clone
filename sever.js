const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
// const io = require('socket.io')(server);
// const {v4:uuidV4} = require('uuid');


app.set('view engine', 'ejs');
app.use(express.static('public'));





// app.get('/:room', (req, res) => {
//     res.render('room', { roomId: req.params.room })
// })


// io.on('connection' , socket => {
//     socket.on('join-room', (roomId, userId) => {
//         console.log(roomId, userId)
//     })
// })

server.listen(3000)