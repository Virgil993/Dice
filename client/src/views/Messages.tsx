import {
  deleteConversationById,
  getConversations,
  getUser,
  getUserById,
} from "@/apiAxios";
import "../styles/messages.css";
import ChatComponent from "@/components/ChatComponent";
import NavbarMain from "@/components/Navbar";
import { type Conversation } from "@/models/conversation";
import { ResponseStatus, type GetUserResponse } from "@/models/request";
import type { FullExternalUser } from "@/models/user";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsFillDice6Fill, BsTrash3 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

function Messages() {
  const navigate = useNavigate();

  const [user, setUser] = useState<GetUserResponse>();
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [navbarLoaded, setNavbarLoaded] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [indexInConversations, setIndexInConversations] = useState<
    number | null
  >(null);
  const toggleModalDelete = () => {
    setModalDelete(!modalDelete);
  };

  const [conversationsInfo, setConversationsInfo] = useState<{
    [key: string]: {
      user: FullExternalUser;
    };
  }>({});

  useEffect(() => {
    async function getConversationsAndUsers() {
      setConversationsLoaded(false);
      setUserLoaded(false);
      // Fetch user details
      const userRes = await getUser();
      if (userRes.data.status === ResponseStatus.ERROR) {
        console.error("Error fetching user details:", userRes.data.message);
        toast.error("Error fetching user details: " + userRes.data.message);
        return;
      }
      setUser(userRes.data);
      setUserLoaded(true);

      const res = await getConversations();
      if (res.data.status === ResponseStatus.ERROR) {
        console.error("Error fetching conversations:", res.data.message);
        toast.error("Error fetching conversations: " + res.data.message);
        return;
      }
      // Create promises to fetch user details for each conversation
      const newConversations: Conversation[] = [];
      for (const conversation of res.data.conversations) {
        const userId =
          conversation.user1Id === localStorage.getItem("userId")
            ? conversation.user2Id
            : conversation.user1Id;
        const userResponse = await getUserById(userId);
        if (userResponse.data.status === ResponseStatus.ERROR) {
          console.error(
            "Error fetching user details:",
            userResponse.data.message
          );
          toast.error(
            "Error fetching user details: " + userResponse.data.message
          );
          continue;
        }
        const user = userResponse.data.user;
        newConversations.push(conversation);
        setConversationsInfo((prev) => ({
          ...prev,
          [conversation.id]: {
            user: user,
          },
        }));
      }
      setAllConversations(newConversations);
      setConversationsLoaded(true);
    }
    if (!user) {
      getConversationsAndUsers();
    }
  }, [user]);

  function findConversationIndexByUserId(userId: string) {
    const index = allConversations.findIndex(
      (element) => element.user1Id === userId || element.user2Id === userId
    );
    return index;
  }

  async function deleteConversation(id: string) {
    const res = await deleteConversationById(id);
    if (res.data.status === ResponseStatus.ERROR) {
      console.error("Error deleting conversation:", res.data.message);
      toast.error("Error deleting conversation: " + res.data.message);
      return;
    }
    toast.success("Conversation deleted successfully");
    setAllConversations((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="messages-body">
      <NavbarMain
        page="messages"
        navbarLoaded={navbarLoaded}
        setNavbarLoaded={setNavbarLoaded}
      ></NavbarMain>
      {navbarLoaded ? (
        <Container className="body-container">
          {conversationsLoaded && allConversations.length != 0 && user ? (
            <Container className="conversations-component">
              <Container className="conversation-profile">
                <div
                  className="profile-picture-conversation-div"
                  id="profile-row-img"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/profile");
                  }}
                >
                  <img
                    src={
                      user.photosUrls.find((photo) => photo.position === 1)
                        ?.url ?? ""
                    }
                    alt="N/A"
                  />
                </div>
                <div className="conversation-profile-text-div">
                  Your conversations
                </div>
              </Container>
              <Container className="conversation-row-container">
                {allConversations.map((elem) => {
                  const userIdToShow =
                    elem.user1Id === user.user.id ? elem.user2Id : elem.user1Id;
                  return (
                    <div
                      key={elem.id}
                      className="conversation-row"
                      id={elem.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setIndexInConversations(
                          findConversationIndexByUserId(userIdToShow)
                        );
                      }}
                    >
                      <div className="profile-picture-conversation-div">
                        <img
                          src={
                            conversationsInfo[elem.id].user.photosUrls.find(
                              (photo) => photo.position === 1
                            )?.url ?? ""
                          }
                          alt="N/A"
                        />
                      </div>
                      <div className="conversation-row-name">
                        {conversationsInfo[elem.id].user.user.name}
                      </div>
                      <div
                        className="delete-conversation-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleModalDelete();
                        }}
                      >
                        <BsTrash3 size={20} />
                      </div>
                      <Modal isOpen={modalDelete} toggle={toggleModalDelete}>
                        <ModalHeader toggle={toggleModalDelete}>
                          Delete contact
                        </ModalHeader>
                        <ModalBody>
                          {" "}
                          Warning! This action will permanently delete this
                          contact and your messages with no chance to retrieve
                          them. You will also not see this person in your
                          dashboard again. Are you sure you want to continue?
                        </ModalBody>
                        <ModalFooter>
                          <Button
                            color="danger"
                            onClick={(e) => {
                              e.preventDefault();
                              deleteConversation(elem.id);
                              const newConversations = allConversations.filter(
                                (c) => c.id !== elem.id
                              );
                              setIndexInConversations(null);
                              setAllConversations([...newConversations]);
                              toggleModalDelete();
                            }}
                          >
                            Yes
                          </Button>
                          <Button onClick={toggleModalDelete}>No</Button>
                        </ModalFooter>
                      </Modal>
                    </div>
                  );
                })}
              </Container>
            </Container>
          ) : userLoaded &&
            conversationsLoaded &&
            allConversations.length == 0 ? (
            <Container className="conversations-component">
              <Container className="conversation-profile">
                <div
                  className="profile-picture-conversation-div"
                  id="profile-row-img"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/profile");
                  }}
                >
                  <img
                    src={
                      user?.photosUrls.find((photo) => photo.position === 1)
                        ?.url ?? ""
                    }
                    alt="N/A"
                  />
                </div>
                <div className="conversation-profile-text-div">
                  Your conversations
                </div>
              </Container>
              <Container className="no-conversations-container">
                You don't have any conversations right now, keep discovering new
                people to fill this list up
              </Container>
            </Container>
          ) : userLoaded && !conversationsLoaded ? (
            <Container className="conversations-component">
              <Container className="conversation-profile">
                <div
                  className="profile-picture-conversation-div"
                  id="profile-row-img"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/profile");
                  }}
                >
                  <img
                    src={
                      user?.photosUrls.find((photo) => photo.position === 1)
                        ?.url ?? ""
                    }
                    alt="N/A"
                  />
                </div>
                <div className="conversation-profile-text-div">
                  Your conversations
                </div>
              </Container>
              <Container className="loading-conversations">
                <Container className="loading-icon">
                  <BsFillDice6Fill size={70} />
                </Container>
                <Container className="loading-conversations-text">
                  Loading conversations...
                </Container>
              </Container>
            </Container>
          ) : (
            <></>
          )}
          {(indexInConversations || indexInConversations == 0) &&
          conversationsLoaded &&
          user ? (
            <ChatComponent
              connectedUser={user}
              receiver={
                conversationsInfo[allConversations[indexInConversations].id]
                  .user
              }
              conversation={allConversations[indexInConversations]}
              setIndexInConversations={setIndexInConversations}
            ></ChatComponent>
          ) : (
            <Container
              style={{
                padding: "0",
                margin: "0",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "600px",
              }}
            ></Container>
          )}
        </Container>
      ) : (
        <Container className="loading-messages">
          <Container className="loading-icon">
            <BsFillDice6Fill size={70} />
          </Container>
          <Container className="loading-text">Loading...</Container>
        </Container>
      )}
    </div>
  );
}

export default Messages;
