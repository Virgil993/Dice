import {
  addMessage,
  getMessagesByConversationId,
  updateMessagesReadStatus,
  updateSingularMessageReadStatus,
} from "@/apiAxios";
import { useWebSocket } from "@/contexts/WebSocketContext";
import type { Conversation } from "@/models/conversation";
import type { Message } from "@/models/message";
import "../styles/chat_component.css";
import {
  ResponseStatus,
  type AddMessageRequest,
  type GetUserResponse,
} from "@/models/request";
import type { FullExternalUser } from "@/models/user";
import { calculateAge } from "@/utils/validation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Container, Modal, ModalBody, ModalHeader } from "reactstrap";
import GameRegister from "./GameRegister";
import { GrClose } from "react-icons/gr";
import { BsSendFill } from "react-icons/bs";
import { ClipLoader } from "react-spinners";
type ChatComponentProps = {
  connectedUser: GetUserResponse;
  conversation: Conversation;
  receiver: FullExternalUser;
  setIndexInConversations: (index: number | null) => void;
};

type WebSocketMessage = {
  type: "message";
  id?: string;
  token?: string;
  to?: string;
  from?: string;
  message?: string;
  timestamp?: string;
};
function ChatComponent({
  connectedUser,
  conversation,
  receiver,
  setIndexInConversations,
}: ChatComponentProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useWebSocket();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationLoad, setConversationLoad] = useState<Conversation | null>(
    null
  );
  const [sending, setSending] = useState(false);
  const [firstUndreadMessageId, setFirstUndreadMessageId] = useState<
    string | null
  >(null);

  const [modalUser, setModalUser] = useState(false);
  const toggleModalUser = () => {
    setModalUser(!modalUser);
  };

  useEffect(() => {
    async function updateSeenMessages() {
      const resMessages = await getMessagesByConversationId(conversation.id);
      if (resMessages.data.status === ResponseStatus.SUCCESS) {
        for (const message of resMessages.data.messages) {
          if (!message.isRead && message.senderId !== connectedUser.user.id) {
            setFirstUndreadMessageId(message.id);
            break;
          }
        }
        setMessages(resMessages.data.messages);
      } else {
        console.error("Error fetching messages:", resMessages.data.message);
        toast.error("Error fetching messages");
        return;
      }
      const res = await updateMessagesReadStatus({
        conversationId: conversation.id,
        isRead: true,
      });
      if (res.data.status === ResponseStatus.ERROR) {
        console.error("Error updating message read status:", res.data.message);
        toast.error("Error updating message read status");
        return;
      }
      setConversationLoad(conversation);
    }
    if (!conversationLoad) {
      updateSeenMessages();
    }
  }, [conversationLoad, conversation, connectedUser.user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !isConnected) return;
    async function handleWebSocketMessage(messageEvent: MessageEvent) {
      const event: WebSocketMessage = JSON.parse(messageEvent.data);
      if (event.type === "message" && event.to === connectedUser.user.id) {
        const newMessage: Message = {
          id: event.id || "",
          conversationId: conversation.id,
          senderId: event.from || "",
          content: event.message || "",
          isRead: true,
          createdAt: event.timestamp ? new Date(event.timestamp) : new Date(),
          readAt: event.timestamp ? new Date(event.timestamp) : new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        await updateSingularMessageReadStatus({
          messageId: newMessage.id,
          isRead: true,
        });
      }
    }
    socket.addEventListener("message", handleWebSocketMessage);
    return () => {
      socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [socket, isConnected, connectedUser.user.id, conversation.id]);

  async function handleSendMessage(
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLDivElement>
  ) {
    e.preventDefault();
    if (sending) return; // Prevent multiple sends
    if (message && socket && isConnected && conversationLoad) {
      const fallbackMessage = message;
      setMessage("");
      setSending(true);
      const token = localStorage.getItem("apiToken") || "";
      const payload: AddMessageRequest = {
        conversationId: conversationLoad.id,
        content: message,
      };
      const res = await addMessage(payload);
      if (res.data.status === ResponseStatus.ERROR) {
        console.error("Error sending message:", res.data.message);
        toast.error("Error sending message");
        setMessage(fallbackMessage); // Restore the message input
        return;
      }
      setSending(false);
      const newMessage: Message = {
        id: res.data.message.id,
        conversationId: conversationLoad.id,
        senderId: connectedUser.user.id,
        content: message,
        isRead: false,
        createdAt: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      const webSocketMessage: WebSocketMessage = {
        type: "message",
        id: res.data.message.id,
        token: token,
        to:
          conversationLoad.user1Id === connectedUser.user.id
            ? conversationLoad.user2Id
            : conversationLoad.user1Id,
        from: connectedUser.user.id,
        message: message,
        timestamp: new Date().toISOString(),
      };

      socket.send(JSON.stringify(webSocketMessage));
    }
  }

  return (
    <Container className="chat-component">
      <Container className="recevier-profile">
        <Container
          className="recevier-container-info"
          onClick={toggleModalUser}
        >
          <div className="recevier-profile-picture">
            <img
              src={
                receiver.photosUrls.find((photo) => photo.position === 1)?.url
              }
              alt="N/A"
            />
          </div>
          <div className="conversation-profile-text-div">
            {receiver.user.name}
          </div>
        </Container>
        <Modal isOpen={modalUser} toggle={toggleModalUser} size="xl">
          <ModalHeader toggle={toggleModalUser}>
            {receiver.user.name}'s profile
          </ModalHeader>
          <ModalBody className="modal-recevier-body">
            <div>Gender: {receiver.user.gender}</div>
            <div>Age: {calculateAge(receiver.user.birthday)}</div>
            <div>Description:</div>
            {receiver.user.description ? (
              <div>{receiver.user.description}</div>
            ) : (
              <div>This user dosen't have a description</div>
            )}
            <div>Photos:</div>
            <div style={{ display: "flex", gap: "20px" }}>
              {receiver.photosUrls.map((element, index) => {
                return (
                  <div style={{ width: "200px", height: "200px" }} key={index}>
                    <img
                      src={element.url}
                      alt="N/A"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "20px",
                      }}
                    ></img>
                  </div>
                );
              })}
            </div>
            <div>Chosen games:</div>
            <div>
              {receiver.games.map((element, index) => {
                return (
                  <GameRegister
                    key={index}
                    name={element.name}
                    onClick={() => {}}
                    isSelected={true}
                  ></GameRegister>
                );
              })}
            </div>
          </ModalBody>
        </Modal>
        <div
          className="close-icon-recevier-profile"
          onClick={(e) => {
            e.preventDefault();
            setIndexInConversations(null);
          }}
        >
          <GrClose size={25} />
        </div>
      </Container>
      <Container id="message-container">
        {messages.length != 0 ? (
          messages.map((elem, index) => {
            const currentDate = new Date(elem.createdAt);
            if (elem.senderId == connectedUser.user.id) {
              return (
                <Container
                  key={index}
                  className="send-container"
                  style={{ justifyContent: "right" }}
                >
                  <div className="send-div">
                    <div>{elem.content}</div>
                    <div style={{ fontSize: "12px" }}>
                      {currentDate.getDate() +
                        "/" +
                        String(currentDate.getMonth() + 1) +
                        "/" +
                        currentDate.getFullYear()}{" "}
                      {currentDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </Container>
              );
            } else if (
              firstUndreadMessageId &&
              elem.id == firstUndreadMessageId
            ) {
              return (
                <Container
                  key={index}
                  className="send-container-unread"
                  style={{ justifyContent: "left" }}
                >
                  <div className="unread-messages">Unread messages</div>
                  <div className="recevie-div">
                    <div>{elem.content}</div>
                    <div style={{ fontSize: "12px" }}>
                      {currentDate.getDate() +
                        "/" +
                        String(currentDate.getMonth() + 1) +
                        "/" +
                        currentDate.getFullYear()}{" "}
                      {currentDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </Container>
              );
            }
            return (
              <Container
                key={index}
                className="send-container"
                style={{ justifyContent: "left" }}
              >
                <div className="recevie-div">
                  <div>{elem.content}</div>
                  <div style={{ fontSize: "12px" }}>
                    {currentDate.getDate() +
                      "/" +
                      String(currentDate.getMonth() + 1) +
                      "/" +
                      currentDate.getFullYear()}{" "}
                    {currentDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Container>
            );
          })
        ) : (
          <Container
            style={{
              display: "flex",
              width: "400px",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{ textAlign: "center", fontSize: "20px", color: "gray" }}
            >
              This is the beginning of your conversation, say hello for starters
              :)
            </div>
          </Container>
        )}
        <div ref={bottomRef} />
      </Container>
      <Container className="send-input">
        {conversationLoad ? (
          <form id="send-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              id="message-input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            ></input>
            <div id="send-button" onClick={handleSendMessage}>
              {" "}
              {sending ? (
                <ClipLoader loading={sending}></ClipLoader>
              ) : (
                <BsSendFill size={30} />
              )}
            </div>
          </form>
        ) : (
          <ClipLoader loading={true} size={50} />
        )}
      </Container>
    </Container>
  );
}

export default ChatComponent;
