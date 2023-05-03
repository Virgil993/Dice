const WebSocket = require("ws")
const mongoose = require("mongoose")
const users = require("./models/users")
const io = require('socket.io')(3000, {cors: {origin: "*"}})


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
    // socket.emit("chat-message","Hello world")
    socket.on("send-chat-message", message => {
        socket.broadcast.emit("chat-message",message)
    })
})