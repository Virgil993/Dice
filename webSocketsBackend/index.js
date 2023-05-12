const WebSocket = require("ws")
const mongoose = require("mongoose")
const users = require("./models/users")
const conversations = require("./models/conversations")
const httpServer = require("http").createServer();
const io = require('socket.io')(httpServer, {
    cors: {origin: "*"}
})


const MONGO_DB_URI =
  "mongodb+srv://Virgil993:NmXc96DxrVIXkKGB@cluster0.znunadm.mongodb.net/Dice"

mongoose.connect(MONGO_DB_URI) 
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
 
// async function getUsers(){
//     const usersDB = await users.find({})
//     console.log(usersDB) 
// }

// getUsers()


  
io.on('connection', socket => {
    console.log("user connected",socket.id)
    socket.on("send-chat-message", async message => {
        socket.broadcast.emit("chat-message",message)
    })

    socket.on("disconnect", () =>{
      console.log("user disconnected",socket.id)
    })
})

httpServer.listen({
    port:3000
})