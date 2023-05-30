const {Server} = require('socket.io')
const io = new Server({
  cors:{
    origin:"*"
  }
})

console.log("Hello we got here")

  
io.on('connection', socket => {
    console.log("user connected",socket.id)  
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


io.listen(3000, ()=>{
  console.log("listening on port 3000")
})
