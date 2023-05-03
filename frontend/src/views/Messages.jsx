import React from "react"
import '../styles/messages.css'
import NavbarMain from "../components/Navbar"
import { Container } from "reactstrap"
import { socket } from "../constants/utils"
import { User } from "../backend_sdk/user.sdk"



function Messages(props){

    
    const [isConnected,setIsConnected] = React.useState(socket.connected)
    const [message,setMessage] = React.useState("")
    const [allMessages,setAllMessages] = React.useState([])
    const [connectedUser,setConnectedUser] = React.useState(null)

    React.useEffect(()=>{
        async function getUser(){
            const res = await User.getUserByToken(localStorage.getItem("apiToken"))
            if(!res || !res.success){
                console.log("error at get user by token");
                navigate("/auth/home");
                return;
            }

            setConnectedUser(res.user)
        }
        if(!connectedUser){
            getUser()
        }
    })
    
    React.useEffect(()=>{
        function onConnect(){
            console.log("User conected")
            setIsConnected(true)
        }
        function onDisconnect(){
            setIsConnected(false)
        }
        function onChatMessage(value){
            if(value.recevier == connectedUser._id)
            {
                var newMessages = allMessages
                newMessages.push({
                    message:value.message,
                    recevier: value.recevier
                })
                setAllMessages([
                    ...newMessages
                ])
                console.log(allMessages)
            }
        }

        socket.on('connect',onConnect);
        socket.on('disconnect',onDisconnect)
        socket.on('chat-message',onChatMessage)

        return () =>{
            socket.off('connect',onConnect)
            socket.off('disconnect',onDisconnect)
            socket.off('chat-message',onChatMessage)
        };
    },[connectedUser])


    return(
        <div className="messages-body">
            <NavbarMain page="messages"></NavbarMain>
            <Container className="chat-component">
                <div id="message-container">
                    {
                        allMessages.map((elem,index)=>{
                            return (
                                <div key={elem.message+index}>
                                    {elem.message}
                                </div>
                            )
                        })
                    }
                </div>
                <form id="send-container">
                <input type="text" id="message-input" value={message} onChange={(e)=>{
                    setMessage(e.target.value)
                }}></input>
                <button type="submit" id="send-button" onClick={(e)=>{
                    e.preventDefault()
                    if(connectedUser && connectedUser._id == "6449191370801257df67c845")
                    {
                        socket.emit("send-chat-message",{message: message, recevier: "64491cf670801257df67c86e"})
                    }
                    else if(connectedUser && connectedUser._id == "64491cf670801257df67c86e"){
                        socket.emit("send-chat-message",{message: message, recevier: "6449191370801257df67c845"})
                    }
                    setMessage("")
                }}> Send</button>
                </form>

            </Container>
        </div>
    )
}

export default Messages