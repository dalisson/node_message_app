const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const filter = require('bad-words')
const {genMessage, genLocationMessage} = require('./utils/message')




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

    socket.emit('message', genMessage('Welcome to the server'))
    socket.broadcast.emit('message', genMessage('new user joined the server'))

    socket.on('sendMessage', (msg, callback)=>{
        const profanefilter = new filter()
        if(profanefilter.isProfane(msg)){
            callback("message blocked due to bad languade")
            return socket.emit("message", genMessage('message blocked'))
        }
        io.emit('message', genMessage(msg))
        callback("message received")
    })

    socket.on('sendLocation', (msg, callback)=>{
        io.emit('locationMessage', genLocationMessage(`https://google.com/maps?q=${msg.latitude},${msg.longitude}`))
        callback()
    })

    socket.on('disconect', ()=>{
        io.emit('message', genMessage('user left the server'))
    })
})

module.exports = server