const pem  = require("pem")

const certProps = {
  days: 365,
  selfSigned: true,
};

pem.createCertificate(certProps, (error, keys) => {
  if (error) {
    throw error;
  }
const credentials = { key: keys.serviceKey, cert: keys.certificate }
const httpsServer = require('https').createServer(credentials);

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


httpsServer.listen(443, ()=>{
  console.log("listening on port 443")
})
})
// httpsServer.listen(8043,()=>{
//   console.log("listening on port 8083")
// })
