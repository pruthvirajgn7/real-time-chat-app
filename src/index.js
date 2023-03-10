const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io') 
const { count } = require('console')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const port = process.env.PORT
const server = http.createServer(app)
const io = socketio(server)

const pathtopublicdir = path.join(__dirname, '../public')

app.use(express.static(pathtopublicdir))

//let cnt = 0

io.on('connection' , (socket) => {

    socket.on('join', ({username,room},callback) => {
        console.log('New WebSocket connection')

        const {error , user} = addUser({id: socket.id , username , room})
    
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))   

        io.to(user.room).emit('roomData', {
            room : user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('sendMessage', (message, callback)=> {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username ,message))
        callback()
    })

    socket.on('sendLocation', (location,callback)=> {
        const user = getUser(socket.id)
        io.to(user.room).emit( 'locationMessage' , generateLocationMessage(user.username , `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users: getUsersInRoom(user.room)
            })
        }        
    })

})

server.listen(port, () => {
    console.log(`server set up at port ${port}`)
})