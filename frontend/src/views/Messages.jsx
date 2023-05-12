import React from "react"
import '../styles/messages.css'
import NavbarMain from "../components/Navbar"
import { Container,Modal,ModalBody,ModalHeader, ModalFooter,Button } from "reactstrap"
import { socket } from "../constants/utils"
import { User } from "../backend_sdk/user.sdk"
import { Conversation } from "../backend_sdk/conversation.sdk"
import ChatComponent from "../components/ChatComponent"
import { readImageFromS3WithNativeSdk } from "../components/ImageHandlingS3"
import { useNavigate } from "react-router-dom"

import {FaTrashAlt} from 'react-icons/fa'


function Messages(props){

    const navigate = useNavigate()

    const [connectedUser,setConnectedUser] = React.useState(null)
    const [conversations,setConversations] = React.useState(null)
    const [conversationsLoaded,setConversationsLoaded] = React.useState(false)
    const [indexInConversations,setIndexInConversations] = React.useState(null)
    const [userLoaded,setUserLoaded] = React.useState(false)

    const [modalDelete,setModalDelete] = React.useState(false)
    const toggleDelete = () => setModalDelete(!modalDelete)

    React.useEffect(()=>{
        async function getUserConversations(){
            const res = await User.getUserByToken(localStorage.getItem("apiToken"))
            if(!res || !res.success){
                console.log("error at get user by token");
                navigate("/auth/home");
                return;
            }

            var profilePicture = await readImageFromS3WithNativeSdk(res.user._id,"1")
            var blob = new Blob([profilePicture.Body],{type: "octet/stream"})
            res.user.profilePicture = URL.createObjectURL(blob)
            setConnectedUser(res.user)

            const convRes  = await Conversation.getByUserId(localStorage.getItem("apiToken"))
            if(!convRes || !convRes.success){
                console.log("error at get conversations")
                return
            }

            for(let i=0;i<convRes.elements.length;i++){
                if(convRes.elements[i].users[0]==res.user._id){
                    var image1 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"1")
                    var image2 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"2")
                    var image3 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"3")
                    var image4 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"4")
                    var currentUserInConv = await User.getUserById(localStorage.getItem("apiToken"),convRes.elements[i].users[1])
                    var blob1 = new Blob([image1.Body],{type: "octet/stream"})
                    var blob2 = new Blob([image2.Body],{type: "octet/stream"})
                    var blob3 = new Blob([image3.Body],{type: "octet/stream"})
                    var blob4 = new Blob([image4.Body],{type: "octet/stream"})
                    convRes.elements[i].profilePicture = URL.createObjectURL(blob1)
                    convRes.elements[i].name = currentUserInConv.user.name
                    convRes.elements[i].recevier = currentUserInConv.user
                    var newPhotos = [blob1,blob2,blob3,blob4]
                    convRes.elements[i].photos = newPhotos
                }
                else{
                    var image1 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[0],"1")
                    var image2 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"2")
                    var image3 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"3")
                    var image4 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"4")
                    var currentUserInConv = await User.getUserById(localStorage.getItem("apiToken"),convRes.elements[i].users[0])
                    var blob1 = new Blob([image1.Body],{type: "octet/stream"})
                    var blob2 = new Blob([image2.Body],{type: "octet/stream"})
                    var blob3 = new Blob([image3.Body],{type: "octet/stream"})
                    var blob4 = new Blob([image4.Body],{type: "octet/stream"})
                    convRes.elements[i].profilePicture = URL.createObjectURL(blob1)
                    convRes.elements[i].name = currentUserInConv.user.name
                    convRes.elements[i].recevier = currentUserInConv.user
                    var newPhotos = [blob1,blob2,blob3,blob4]
                    convRes.elements[i].photos = newPhotos
                }
            }

            setConversations(convRes.elements)
            console.log(convRes.elements)
        }
        if(!connectedUser){
            getUserConversations()
        }
    },[connectedUser,conversations])

    React.useEffect(()=>{
        if(conversations && !conversationsLoaded){
            setConversationsLoaded(true)
        }
        if(connectedUser && !userLoaded){
            setUserLoaded(true)
        }
    },[conversations,conversationsLoaded,connectedUser,userLoaded])


    function findConversationIndexByUserId(userId){
        const index = conversations.findIndex(element => {
            return element.users[0] == userId || element.users[1] == userId
        })
        return index
    }

    async function deleteConversation(id){
        const conRes = await Conversation.delete(localStorage.getItem("apiToken"),id)
        if(!conRes || !conRes.success){
          console.log("error at delete all conversations")
          return
        }
    }


    return(
        <div className="messages-body">
            <NavbarMain page="messages"></NavbarMain>
            <Container className="body-container">
                {
                    conversationsLoaded && conversations.length!=0 ?
                    <Container className="conversations-component">
                        <Container className="conversation-profile">
                            <div className="profile-picture-conversation-div" id="profile-row-img" onClick={(e)=>{
                                e.preventDefault()
                                navigate("/admin/profile")
                            }}>
                                <img src={connectedUser.profilePicture} alt="N/A"/>
                            </div>
                            <div className="conversation-profile-text-div">Your conversations</div>
                        </Container>
                        <Container className="conversation-row-container">
                            {
                                conversations.map((elem,index)=>{
                                    var userIdToShow 
                                    if(elem.users[0] == connectedUser._id){
                                        userIdToShow = elem.users[1]
                                    }
                                    else{
                                        userIdToShow = elem.users[0]
                                    }
                                    return(
                                        <div key={elem._id} className="conversation-row" id={String(elem._id)} onClick={(e)=>{
                                            e.preventDefault()
                                            setIndexInConversations(findConversationIndexByUserId(userIdToShow))
                                            
                                        }}>
                                            <div className="profile-picture-conversation-div">
                                                <img src={elem.profilePicture} alt="N/A"/>
                                            </div>
                                            <div className="conversation-row-name">{elem.name}</div>
                                            <div className="delete-conversation-button" onClick={(e)=>{
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleDelete()
                                            }}>
                                                <FaTrashAlt size={20}/>
                                            </div>
                                            <Modal isOpen={modalDelete} toggle={toggleDelete} >
                                                <ModalHeader toggle={toggleDelete}>Delete contact</ModalHeader>
                                                <ModalBody> Warning! This action will permanently delete this contact and your messages with no chance to retrieve them. You will also not see this person in your dashboard again. Are you sure you want to continue?</ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" onClick={(e)=>{
                                                    e.preventDefault()
                                                    deleteConversation(elem._id)
                                                    var newConversations = conversations
                                                    newConversations = newConversations.filter(item => item._id != elem._id)
                                                    setIndexInConversations(null)
                                                    setConversations([...newConversations])
                                                    toggleDelete()
                                                    }}>
                                                    Yes
                                                    </Button>
                                                    <Button onClick={toggleDelete}>
                                                    No
                                                    </Button>
                                                </ModalFooter>
                                            </Modal>
                                        </div>
                                    )
                                })
                            }
                        </Container>
                    </Container>
                    :                 
                    userLoaded ?
                    <Container className="conversations-component">
                    <Container className="conversation-profile">
                        <div className="profile-picture-conversation-div" id="profile-row-img" onClick={(e)=>{
                            e.preventDefault()
                            navigate("/admin/profile")
                        }}>
                            <img src={connectedUser.profilePicture} alt="N/A"/>
                        </div>
                        <div className="conversation-profile-text-div">Your conversations</div>
                    </Container>
                    <Container className="no-conversations-container">
                        You don't have any conversations right now, keep discovering new people to fill this list up
                    </Container>
                    </Container>
                    :
                    <></>
                    
                    
                }
                {
                    (indexInConversations || indexInConversations == 0) && conversationsLoaded ?
                    <ChatComponent connectedUser = {connectedUser} conversation = {conversations[indexInConversations]} key={conversations[indexInConversations]._id} indexInConversations={indexInConversations} setIndexInConversations={setIndexInConversations}></ChatComponent>
                    :
                    <Container style={{padding:"0",margin:"0",display:"flex",justifyContent:"center",alignItems:"center",height:"600px"}}></Container>
                }
            </Container>
            
        </div>
    )
}

export default Messages