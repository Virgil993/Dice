import React from 'react'
import { Container, Modal, ModalHeader, ModalBody } from "reactstrap"
import { Message } from '../backend_sdk/message.sdk'
import '../styles/chat_component.css'
import { availableGames  } from "../constants/utils"
import {socket} from '../socket'
import {BsSendFill} from 'react-icons/bs'
import {GrClose} from 'react-icons/gr'
import GameRegister from './GameRegister'
import { useDispatch, useSelector } from 'react-redux'
import { removeAllNotificationsFromConversation } from '../redux/notificationsSlice'

function ChatComponent(props){


    const bottomRef = React.useRef(null)

    const {conversations,messages} = useSelector((state) => state.notifications)
    const dispatch = useDispatch()

    const [isConnected,setIsConnected] = React.useState(socket.connected)
    const [currentNotifications,setCurrentNotifications] = React.useState(null)
    const [message,setMessage] = React.useState("")
    const [allMessages,setAllMessages] = React.useState([])
    const [recevier,setRecevier] = React.useState(null)
    const [conversation,setConversation] = React.useState(null)

    const [modalUser,setModalUser] = React.useState(false)
    const toggleUser = ()=>setModalUser(!modalUser)

    React.useEffect(()=>{

        async function updateSeenMessages(messages){
           const res =  await Message.updateSeen(localStorage.getItem("apiToken"),messages)
           if(!res || !res.success){
                console.log(res)
                console.log("error at update seen messages")
                return
           }
        }

        var localStorageConv = JSON.parse(localStorage.getItem("conversations"))
        var localStorageMessages = JSON.parse(localStorage.getItem("messages"))

        if(localStorageConv.includes(props.conversation._id)){
            var localUpdateMessages = localStorageMessages.filter(elem => elem.conversationId == props.conversation._id)
            setCurrentNotifications([...localUpdateMessages])
            localStorageConv = localStorageConv.filter(elem => elem != props.conversation._id)
            localStorageMessages = localStorageMessages.filter(elem => elem.conversationId != props.conversation._id)
            localStorage.setItem("conversations",JSON.stringify(localStorageConv))
            localStorage.setItem("messages",JSON.stringify(localStorageMessages))
            dispatch(removeAllNotificationsFromConversation({
                conversationId: props.conversation._id
            })) 
            updateSeenMessages(localUpdateMessages)
        }

    },[conversations,messages])

    React.useEffect(()=>{
        bottomRef.current?.scrollIntoView({behavior:'smooth'});
    },[allMessages]);

    React.useEffect(()=>{
        async function getConversation(){
            let dbMessages = await Message.getByConversationId(localStorage.getItem("apiToken"),props.conversation._id)
            if(!dbMessages || !dbMessages.success){
                console.log("error at get conversation")
                return
            } 
            setConversation(props.conversation)
            setAllMessages(dbMessages.elements)
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
        async function onChatMessage(value){
            if(value.recevier == props.connectedUser._id && value.sender==recevier)
            {
                
                var newMessages = allMessages
                newMessages.push({
                    _id: value._id,
                    conversationId: value.conversationId,
                    sender: value.sender,
                    text:value.text,
                    recevier: value.recevier,
                    date: value.date,
                    seen: true,
                })
                setAllMessages([
                    ...newMessages
                ])
                
                await Message.updateSeen(localStorage.getItem("apiToken"),[
                    {
                        _id: value._id,
                        conversationId: value.conversationId,
                        sender: value.sender,
                        text:value.text,
                        recevier: value.recevier,
                        date: value.date,
                        seen: true,
                    }
                ])
            }
        }

        socket.on('chat-message',onChatMessage)

        return () =>{
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
                            if(element.length>100){
                                return(
                                    <div style={{width:"200px",height:"200px"}} key={element+index}>
                                        <img src={element} alt='N/A' style={{width:"100%",height:"100%",borderRadius:"20px"}}></img>
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
                                <GameRegister key={element*index+index} name={availableGames[element]} isSelected={true}></GameRegister>
                            )
                        })
                    }
                </div>
            </ModalBody>
            </Modal>
            <div className='close-icon-recevier-profile' onClick={(e)=>{
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
                            <Container key={currentDate} className='send-container' style={{justifyContent:"right"}}>
                                <div className='send-div'>
                                <div>{elem.text}</div>
                                <div style={{fontSize:"12px"}}>{ currentDate.getDate() +"/" + String(parseInt(currentDate.getMonth())+1)+"/"+ currentDate.getFullYear()} {
                                currentDate.toLocaleTimeString('en-US', {hour: '2-digit',minute: '2-digit'})
                                }</div>
                                </div>
                            </Container>
                        )
                    }
                    else if(currentNotifications && currentNotifications.length != 0 &&  elem._id == currentNotifications[0]._id){
                        return (
                            <Container key={currentDate} className='send-container' style={{justifyContent:"left"}}>
                                <div className='recevie-div'>
                                    <div>Not read</div>
                                    <div>{elem.text}</div>
                                    <div style={{fontSize:"12px"}}>{ currentDate.getDate() +"/" + String(parseInt(currentDate.getMonth())+1)+"/"+ currentDate.getFullYear()} {
                                    currentDate.toLocaleTimeString('en-US', {hour: '2-digit',minute: '2-digit'})
                                    }</div>
                                </div>
                            </Container>
                        )
                    }
                    return (
                        <Container key={currentDate} className='send-container' style={{justifyContent:"left"}}>
                            <div className='recevie-div'>
                                <div>{elem.text}</div>
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
                    const res = await Message.create(localStorage.getItem("apiToken"),props.conversation._id,message,props.connectedUser._id,recevier, new Date(),false)
                    if(!res || !res.success){
                        console.log("error at add message")
                        return
                    }
                    var newMessages = allMessages
                    newMessages.push({
                        _id: res.messageId,
                        conversationId: props.conversation._id,
                        text:message,
                        sender: props.connectedUser._id,
                        recevier: recevier,
                        date: new Date(),
                        seen: false,
                    })
                    setAllMessages([
                        ...newMessages
                    ])
                    socket.emit("send-chat-message",{
                        _id: res.messageId,
                        conversationId: props.conversation._id,
                        text:message,
                        sender: props.connectedUser._id,
                        recevier: recevier,
                        date: new Date(),
                        seen: false,
                    })
                    socket.emit("send-notification",{
                        conversationId: conversation._id,
                        message:{
                            _id: res.messageId,
                            conversationId: props.conversation._id,
                            text:message,
                            sender: props.connectedUser._id,
                            recevier: recevier,
                            date: new Date(),
                            seen: false,
                        }
                    })
                    setMessage("")
                }
            }}>
            <input type="text" id="message-input" value={message} onChange={(e)=>{
                setMessage(e.target.value)
            }}></input>
            <div type="submit" id="send-button" onClick={async (e)=>{
                e.preventDefault()
                if(message){
                    const res = await Message.create(localStorage.getItem("apiToken"),props.conversation._id,message,props.connectedUser._id,recevier, new Date(),false)
                    if(!res || !res.success){
                        console.log("error at add message")
                        return
                    }
                    var newMessages = allMessages
                    newMessages.push({
                        _id: res.messageId,
                        conversationId: props.conversation._id,
                        text:message,
                        sender: props.connectedUser._id,
                        recevier: recevier,
                        date: new Date(),
                        seen: false,
                    })
                    setAllMessages([
                        ...newMessages
                    ])
                    socket.emit("send-chat-message",{
                        _id: res.messageId,
                        conversationId: props.conversation._id,
                        text:message,
                        sender: props.connectedUser._id,
                        recevier: recevier,
                        date: new Date(),
                        seen: false,
                    })
                    socket.emit("send-notification",{
                        conversationId: conversation._id,
                        message:{
                            _id: res.messageId,
                            conversationId: props.conversation._id,
                            text:message,
                            sender: props.connectedUser._id,
                            recevier: recevier,
                            date: new Date(),
                            seen: false,
                        }
                    })
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