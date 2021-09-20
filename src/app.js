const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const filter = require('bad-words')
const {genMessage, genLocationMessage} = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')




const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicPath = path.join(__dirname, '../public')


const viewsPath=path.join(publicPath, 'views')
app.set('views', viewsPath)
app.set('view engine', 'hbs')

app.use(express.static(publicPath))

let count = 0
io.on('connection', (socket) =>{
    console.log('client connected')

    
    socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return callback(error)
        }

        socket.join(room)
        socket.emit('message', genMessage('Welcome to the server', 'server'))
        socket.broadcast.to(user.room).emit('message', genMessage(`${user.username} joined the server`, user.username))
        io.to(user.room).emit('userList', {
            room: user.room,
            users : getUsersInRoom(user.room)
        })

    })

    socket.on('sendMessage', (msg, callback)=>{
        const user =getUser(socket.id)
        const profanefilter = new filter()
        if(profanefilter.isProfane(msg)){
            return callback("message blocked due to bad languade")
        }
        io.to(user.room).emit('message', genMessage(msg, user.username))
        callback("message received")
    })

    socket.on('sendLocation', (msg, callback)=>{
        const user =getUser(socket.id)
        io.to(user.room).emit('locationMessage', genLocationMessage(`https://google.com/maps?q=${msg.latitude},${msg.longitude}`, user.username))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', genMessage(`${user.username} has left the server`, 'server'))
            io.to(user.room).emit('userList', {
                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }
        
    })
})

module.exports = server