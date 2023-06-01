const httpServer = require('http').createServer();

const io = require("socket.io")(httpServer,{
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


httpServer.listen(3000, ()=>{
  console.log("listening on port 3000")
})
// httpsServer.listen(8043,()=>{
//   console.log("listening on port 8083")
// })
