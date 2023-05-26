import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../backend_sdk/user.sdk";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { addNotification, setNotifications } from "../redux/notificationsSlice";
import { Message } from "../backend_sdk/message.sdk";

function Admin(props) {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userId,setUserId] = React.useState(null)


  React.useEffect(() => {
    if (
      localStorage.getItem("apiToken") === null
    ) {
      localStorage.clear();
      navigate("/auth/home");
      return
    }
    async function checkToken() {
      const res = await User.getUserByToken(localStorage.getItem("apiToken"));
      if (!res || !res.success) {
        console.log(res);
        localStorage.clear();
        navigate("/auth/home");
      }
      if(!JSON.parse(localStorage.getItem("retrievedNotifications"))){
        const resNotifications = await Message.getNotifications(res.user._id)
        if(!resNotifications || !resNotifications.success){
          console.log("error at getting notifications")
          return
        }
        localStorage.setItem("conversations",JSON.stringify(resNotifications.conversations))
        localStorage.setItem("messages",JSON.stringify(resNotifications.messages))
        localStorage.setItem("retrievedNotifications",JSON.stringify(true))
      }
      dispatch(setNotifications({
        messages: JSON.parse(localStorage.getItem("messages")),
        conversations: JSON.parse(localStorage.getItem("conversations"))
      }))
      setUserId(res.user._id)
    }
    checkToken();
  },[userId]);


  React.useEffect(()=>{

    function onNotification(notification){
      if(userId === notification.message.recevier){
        var conversations = JSON.parse(localStorage.getItem("conversations"))
        var messages = JSON.parse(localStorage.getItem("messages"))
        var foundConversation = false
        for(let i=0;i<conversations.length;i++){
            if(conversations[i] == notification.conversationId)
            {
              foundConversation = true
              break;
            }
        }
        if(!foundConversation){
          conversations.push(notification.conversationId)
        }
        messages.push(notification.message)
        localStorage.setItem("conversations",JSON.stringify(conversations))
        localStorage.setItem("messages",JSON.stringify(messages))
        dispatch(setNotifications({
          messages: messages,
          conversations: conversations
        }))
      }
    }
 
    socket.on('notification',onNotification)

    return () =>{
      socket.off('notification',onNotification) 
    };

  },[userId])

  return <>{props.element}</>;
}

export default Admin;
