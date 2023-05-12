import React from 'react'
import { Container,Card,CardBody,CardTitle, Button, CardText, Modal, ModalHeader, ModalBody } from "reactstrap"
import { User } from "../backend_sdk/user.sdk"
import { Conversation } from "../backend_sdk/conversation.sdk"
import '../styles/chat_component.css'
import { availableGames, socket } from "../constants/utils"
import {AiOutlineSend} from 'react-icons/ai'
import {BsSendFill} from 'react-icons/bs'
import {GrClose} from 'react-icons/gr'
import GameRegister from './GameRegister'

function ChatComponent(props){


    const bottomRef = React.useRef(null)

    const [isConnected,setIsConnected] = React.useState(socket.connected)
    const [message,setMessage] = React.useState("")
    const [allMessages,setAllMessages] = React.useState([])
    const [recevier,setRecevier] = React.useState(null)
    const [conversation,setConversation] = React.useState(null)

    const [modalUser,setModalUser] = React.useState(false)
    const toggleUser = ()=>setModalUser(!modalUser)

    React.useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior:'smooth'});
    },[allMessages]);

    React.useEffect(()=>{
        async function getConversation(){
            let dbMessages = await Conversation.getByBothUserId(props.conversation.users[0],props.conversation.users[1])
            if(!dbMessages || !dbMessages.success){
                console.log("error at get conversation")
                return
            } 
            setConversation(dbMessages.element)
            setAllMessages(dbMessages.element.messages)
        }
        if(!conversation){
            getConversation()
        }
    },[allMessages,conversation])

    React.useEffect(()=>{
        let connectedUserId = props.connectedUser._id
        let currentConversation = props.conversation

        if(currentConversation.users[0] == connectedUserId){
            setRecevier(currentConversation.users[1])
        }
        else{
            setRecevier(currentConversation.users[0])
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
            if(value.recevier == props.connectedUser._id && value.sender==recevier)
            {
                
                var newMessages = allMessages
                newMessages.push({
                    sender: value.sender,
                    message:value.message,
                    recevier: value.recevier,
                    date: new Date()
                })
                setAllMessages([
                    ...newMessages
                ])
                
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
    },[props.connectedUser,recevier,allMessages])

    function calculateAge(date){
        var newDate = new Date(date);
        var nowDate = new Date();
        var ageDifMs = newDate - nowDate;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970)-1;
    }

    return(
        <Container className="chat-component">
        <Container className='recevier-profile'>
            <Container className='recevier-container-info' onClick={toggleUser}>
            <div className="recevier-profile-picture">
                <img src={props.conversation.profilePicture} alt="N/A"/>
            </div>
            <div className="conversation-profile-text-div">{props.conversation.name}</div>
            </Container>
            <Modal isOpen={modalUser} toggle={toggleUser} size='xl'>
            <ModalHeader toggle={toggleUser}>{props.conversation.name}'s profile</ModalHeader>
            <ModalBody className='modal-recevier-body'>
                <div>Gender: {props.conversation.recevier.gender}</div>
                <div>Age: {calculateAge(props.conversation.recevier.birthday)}</div>
                <div>Description:</div>
                {
                    props.conversation.recevier.description ?
                    <div>{props.conversation.recevier.description}</div>
                    :
                    <div>This user dosen't have a description</div>
                }
                <div>Photos:</div>
                <div style={{display:"flex",gap:"20px"}}>
                    {
                        props.conversation.photos.map((element,index)=>{
                            if(element.size!=0){
                                return(
                                    <div style={{width:"200px",height:"200px"}} key={element+index}>
                                        <img src={URL.createObjectURL(element)} alt='N/A' style={{width:"100%",height:"100%",borderRadius:"20px"}}></img>
                                    </div>
                                )
                            }
                            return <></>
                        })
                    }
                </div>
                <div>Chosen games:</div>
                <div>
                    {
                        props.conversation.recevier.gamesSelected.map((element,index)=>{
                            return(
                                <GameRegister key={element+index} name={availableGames[element]} isSelected={true}></GameRegister>
                            )
                        })
                    }
                </div>
            </ModalBody>
            </Modal>
            <div className='close-icon-recevier-profile' onClick={(e)=>{
                console.log(props.conversation.recevier.gender)
                e.preventDefault()
                props.setIndexInConversations(null)
            }}>
                <GrClose size={25} />
            </div>
        </Container>
        <Container id="message-container" >
            {   
                allMessages.length != 0 ?
                allMessages.map((elem,index)=>{
                    let currentDate = new Date(elem.date)
                    if(elem.sender == props.connectedUser._id){
                        return (
                            <Container key={elem.message+elem.sender+elem.recevier+index} className='send-container' style={{justifyContent:"right"}}>
                                <div className='send-div'>
                                <div>{elem.message}</div>
                                <div style={{fontSize:"12px"}}>{ currentDate.getDate() +"/" + String(parseInt(currentDate.getMonth())+1)+"/"+ currentDate.getFullYear()} {
                                currentDate.toLocaleTimeString('en-US', {hour: '2-digit',minute: '2-digit'})
                                }</div>
                                </div>
                            </Container>
                        )
                    }
                    return (
                        <Container key={elem.message+elem.sender+elem.recevier+index} className='send-container' style={{justifyContent:"left"}}>
                            <div className='recevie-div'>
                                <div>{elem.message}</div>
                                <div style={{fontSize:"12px"}}>{ currentDate.getDate() +"/" + String(parseInt(currentDate.getMonth())+1)+"/"+ currentDate.getFullYear()} {
                                currentDate.toLocaleTimeString('en-US', {hour: '2-digit',minute: '2-digit'})
                                }</div>
                            </div>
                        </Container>
                    )
                })
                :
                <Container style={{display:"flex",width:"400px",height:"100%",justifyContent:"center",alignItems:"center"}}>
                    <div style={{textAlign:"center",fontSize:"20px",color:"gray"}}>This is the beginning of your conversation, say hello for starters :)</div>
                </Container>
            }
            <div ref={bottomRef}/>
        </Container>
        <Container className='send-input'>
        {
            recevier && conversation ?
            <form id="send-form" onSubmit={async (e)=>{
                e.preventDefault()
                if(message){
                    const res = await Conversation.addMessage({message: message, recevier: recevier, sender: props.connectedUser._id,date: new Date()})
                    if(!res || !res.success){
                        console.log("error at add message")
                        return
                    }
                    var newMessages = allMessages
                    newMessages.push({
                        sender: props.connectedUser._id,
                        message:message,
                        recevier: recevier,
                        date: new Date()
                    })
                    setAllMessages([
                        ...newMessages
                    ])
                    socket.emit("send-chat-message",{message: message, recevier: recevier, sender: props.connectedUser._id,date: new Date()})
                    setMessage("")
                }
            }}>
            <input type="text" id="message-input" value={message} onChange={(e)=>{
                setMessage(e.target.value)
            }}></input>
            <div type="submit" id="send-button" onClick={async (e)=>{
                e.preventDefault()
                if(message){
                    const res = await Conversation.addMessage({message: message, recevier: recevier, sender: props.connectedUser._id,date: new Date()})
                    if(!res || !res.success){
                        console.log("error at add message")
                        return
                    }
                    var newMessages = allMessages
                    newMessages.push({
                        sender: props.connectedUser._id,
                        message:message,
                        recevier: recevier,
                        date: new Date()
                    })
                    setAllMessages([
                        ...newMessages
                    ])
                    socket.emit("send-chat-message",{message: message, recevier: recevier, sender: props.connectedUser._id,date: new Date()})
                    setMessage("")
                }
            }}> <BsSendFill  size={30}/></div>
            </form>
            :
            <></>
        }
        </Container>

    </Container>
    )
}

export default ChatComponent