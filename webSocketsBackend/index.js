const io = require('socket.io')(3000, {
    cors: {origin: "http://localhost:8080"}
})


  
io.on('connection', socket => {
    console.log("user connected lesgo",socket.id)
    socket.on("send-chat-message", async message => {
        socket.broadcast.emit("chat-message",message)
    })

    socket.on("send-notification", async notification => {
      socket.broadcast.emit("notification",notification)
    })

    socket.on("disconnect", () =>{
      console.log("user disconnected",socket.id)
    })
})

