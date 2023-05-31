const fs = require('fs')
const passphrase = "D!ge#do%smainP2S34"
const httpsServer = require('https').createServer({
  key: fs.readFileSync('E:\\AWS Dice Server Configurations\\domain.key'),
  cert: fs.readFileSync('E:\\AWS Dice Server Configurations\\domain.crt'),
  passphrase: passphrase
});
// const httpServer = require('http').createServer();

const io = require("socket.io")(httpsServer,{
  cors:{
    origin:"https://splendid-pithivier-237689.netlify.app/"
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


httpsServer.listen(3000, ()=>{
  console.log("listening on port 3000")
})

// httpsServer.listen(8043,()=>{
//   console.log("listening on port 8083")
// })
