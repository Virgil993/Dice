import React from "react"
import '../styles/messages.css'
import NavbarMain from "../components/Navbar"
import { Container,Modal,ModalBody,ModalHeader, ModalFooter,Button } from "reactstrap"
import { User } from "../backend_sdk/user.sdk"
import { Conversation } from "../backend_sdk/conversation.sdk"
import { Message } from "../backend_sdk/message.sdk"
import ChatComponent from "../components/ChatComponent"
import { readImageFromS3WithNativeSdk } from "../components/ImageHandlingS3"
import { useNavigate } from "react-router-dom"
import {FaTrashAlt} from 'react-icons/fa'
import {BsTrash3} from 'react-icons/bs'
import { useSelector } from "react-redux"
import {BsFillDice6Fill} from 'react-icons/bs'

function Messages(props){

    const navigate = useNavigate()

    const {conversations,messages} = useSelector((state) => state.notifications)

    const [connectedUser,setConnectedUser] = React.useState(null)
    const [allConversations,setAllConversations] = React.useState(null)
    const [conversationsLoaded,setConversationsLoaded] = React.useState(false)
    const [indexInConversations,setIndexInConversations] = React.useState(null)
    const [userLoaded,setUserLoaded] = React.useState(false)
    const [navbarLoaded,setNavbarLoaded] = React.useState(false)


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
            res.user.profilePicture = profilePicture.data
            setConnectedUser(res.user)

            const convRes  = await Conversation.getByUserId(localStorage.getItem("apiToken"))
            if(!convRes || !convRes.success){
                console.log("error at get allConversations")
                return
            }

            for(let i=0;i<convRes.elements.length;i++){
                if(convRes.elements[i].users[0]==res.user._id){
                    var image1 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"1")
                    var image2 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"2")
                    var image3 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"3")
                    var image4 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[1],"4")
                    var currentUserInConv = await User.getUserById(localStorage.getItem("apiToken"),convRes.elements[i].users[1])
                    convRes.elements[i].profilePicture = image1.data
                    convRes.elements[i].name = currentUserInConv.user.name
                    convRes.elements[i].recevier = currentUserInConv.user
                    var newPhotos = [image1.data,image2.data,image3.data,image4.data]
                    convRes.elements[i].photos = newPhotos
                }
                else{
                    var image1 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[0],"1")
                    var image2 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[0],"2")
                    var image3 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[0],"3")
                    var image4 = await readImageFromS3WithNativeSdk(convRes.elements[i].users[0],"4")
                    var currentUserInConv = await User.getUserById(localStorage.getItem("apiToken"),convRes.elements[i].users[0])
                    convRes.elements[i].profilePicture = image1.data
                    convRes.elements[i].name = currentUserInConv.user.name
                    convRes.elements[i].recevier = currentUserInConv.user
                    var newPhotos = [image1.data,image2.data,image3.data,image4.data]
                    convRes.elements[i].photos = newPhotos
                }
            }
            setAllConversations(convRes.elements)
        }
        if(!connectedUser){
            getUserConversations()
        }
    },[connectedUser,allConversations])

    React.useEffect(()=>{
        if(allConversations && !conversationsLoaded){
            setConversationsLoaded(true)
        }
        if(connectedUser && !userLoaded){
            setUserLoaded(true)
        }
    },[allConversations,conversationsLoaded,connectedUser,userLoaded])


    function findConversationIndexByUserId(userId){
        const index = allConversations.findIndex(element => {
            return element.users[0] == userId || element.users[1] == userId
        })
        return index
    }

    async function deleteConversation(id){
        const conRes = await Conversation.delete(localStorage.getItem("apiToken"),id)
        if(!conRes || !conRes.success){
          console.log("error at delete conversation")
          return
        }

        const messageRes = Message.deleteAllByConversationId(localStorage.getItem("apiToken"),id)
        if(!messageRes || !messageRes.success){
            console.log("error at delete conversation")
            return
          }
    }

    function getConversationMessagesLength(id){
        return messages.filter(elem => elem.conversationId == id).length
    }


    return(
        <div className="messages-body">
            <NavbarMain page="messages" navbarLoaded={navbarLoaded} setNavbarLoaded={setNavbarLoaded}></NavbarMain>
            {
                navbarLoaded ?
                <Container className="body-container">
                {
                    conversationsLoaded && allConversations.length!=0 ?
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
                                allConversations.map((elem,index)=>{
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
                                            {
                                                conversations && conversations.includes(elem._id) ?
                                                <div className="notification-div-conversation-row">
                                                <div className="notification-point-conversation-row">
                                                    <div>
                                                    {getConversationMessagesLength(elem._id)}
                                                    </div>
                                                </div>
                                                </div>
                                                :
                                                <></>
                                            }
                                            <div className="delete-conversation-button" onClick={(e)=>{
                                                e.preventDefault()
                                                e.stopPropagation()
                                                toggleDelete()
                                            }}>
                                                <BsTrash3 size={20}/>
                                            </div>
                                            <Modal isOpen={modalDelete} toggle={toggleDelete} >
                                                <ModalHeader toggle={toggleDelete}>Delete contact</ModalHeader>
                                                <ModalBody> Warning! This action will permanently delete this contact and your messages with no chance to retrieve them. You will also not see this person in your dashboard again. Are you sure you want to continue?</ModalBody>
                                                <ModalFooter>
                                                    <Button color="danger" onClick={(e)=>{
                                                    e.preventDefault()
                                                    deleteConversation(elem._id)
                                                    var newConversations = allConversations
                                                    newConversations = newConversations.filter(item => item._id != elem._id)
                                                    setIndexInConversations(null)
                                                    setAllConversations([...newConversations])
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
                    userLoaded && conversationsLoaded && allConversations.length==0 ?
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
                    userLoaded && !conversationsLoaded ?
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
                    <Container className="loading-conversations">
                        <Container className="loading-icon"><BsFillDice6Fill size={70}/></Container>
                        <Container className="loading-conversations-text">Loading conversations...</Container>
                    </Container> 
                    </Container>              
                    :
                    <></>
                }
                {
                    (indexInConversations || indexInConversations == 0) && conversationsLoaded ?
                    <ChatComponent connectedUser = {connectedUser} conversation = {allConversations[indexInConversations]} key={allConversations[indexInConversations]._id} indexInConversations={indexInConversations} setIndexInConversations={setIndexInConversations}></ChatComponent>
                    :
                    <Container style={{padding:"0",margin:"0",display:"flex",justifyContent:"center",alignItems:"center",height:"600px"}}></Container>
                }
                </Container>
                :
                <Container className="loading-messages">
                    <Container className="loading-icon"><BsFillDice6Fill size={70}/></Container>
                    <Container className="loading-text">Loading...</Container>
                </Container>
                
            }
        </div>
    )
}

export default Messages