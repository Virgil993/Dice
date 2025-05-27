import React from "react";
import { Container, Card, CardTitle, Button, CardText } from "reactstrap";
import "../styles/dashboard_person.css";
import FsLightbox from "fslightbox-react";
import { calculateAge } from "@/utils/validation";
import type { FullExternalUser } from "@/models/user";
import type { Game } from "@/models/game";
import type { SwipeAction } from "@/models/swipe";
import { addSwipe } from "@/apiAxios";
import { ResponseStatus, type AddSwipeRequest } from "@/models/request";
import toast from "react-hot-toast";

export interface DashboardPersonProps {
  noMoreUsers?: boolean;
  user: FullExternalUser;
  gamesSelected: Game[];
  indexInUsers: number;
  maxLength: number;
  setIndexInUsers: (index: number) => void;
}

function DashboardPerson(props: DashboardPersonProps) {
  const [lightboxController, setLightboxController] = React.useState({
    toggler: false,
    slide: 1,
  });
  const [commonGames, setCommonGames] = React.useState<Game[] | null>(null);
  const [commonGamesLoaded, setCommonGamesLoaded] = React.useState(false);
  const [moreUsersAvailable, setMoreUsersAvailable] = React.useState(true);

  React.useEffect(() => {
    if (props.noMoreUsers) {
      setMoreUsersAvailable(false);
    }
  }, [moreUsersAvailable, props.noMoreUsers]);

  React.useEffect(() => {
    function elemCommon(gamesSelected: Game[], userGames: Game[]) {
      return gamesSelected.filter((game) =>
        userGames.some((userGame) => userGame.id === game.id)
      );
    }

    if (commonGames === null) {
      setCommonGames(elemCommon(props.gamesSelected, props.user.games));
    }
  }, [commonGames, props.gamesSelected, props.user.games]);

  React.useEffect(() => {
    if (commonGames) {
      setCommonGamesLoaded(true);
    }
  }, [commonGames, commonGamesLoaded]);

  function openLighboxOnSlide(number: number) {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: number,
    });
  }

  async function updateSwipe(action: SwipeAction) {
    const payload: AddSwipeRequest = {
      swipedId: props.user.user.id,
      action: action,
    };
    const res = await addSwipe(payload);
    if (res.data.status === ResponseStatus.ERROR) {
      toast.error("Error at adding swipe, please try again later");
      console.log("Error at add swipe", res.data.message);
      return;
    }
  }

  return moreUsersAvailable ? (
    <Container className="dasboard-person-body">
      <Card className="card-main">
        <Container className="name-card-main">
          <Container className="container-header-card-main">
            <h2>
              {props.user.user.name} {calculateAge(props.user.user.birthday)}
            </h2>
            <h4>{props.user.user.gender}</h4>
          </Container>
          <Container className="container-actions-card-main">
            <Button
              className="buttons-choose"
              onClick={() => {
                updateSwipe("dislike");
                if (props.indexInUsers < props.maxLength - 1) {
                  props.setIndexInUsers(props.indexInUsers + 1);
                } else {
                  setMoreUsersAvailable(false);
                }
              }}
            >
              PASS
            </Button>
            <Button
              className="buttons-choose"
              color="success"
              onClick={() => {
                updateSwipe("like");
                if (props.indexInUsers < props.maxLength - 1) {
                  props.setIndexInUsers(props.indexInUsers + 1);
                } else {
                  setMoreUsersAvailable(false);
                }
              }}
            >
              PLAY
            </Button>
          </Container>
        </Container>

        <Container className="photos-card-main">
          {props.user.photosUrls.map((element, index) => {
            return (
              <img
                src={element.url}
                key={element.position}
                alt="N/A"
                style={{
                  width: "200px",
                  margin: "10px",
                  height: "230px",
                  cursor: "pointer",
                  borderRadius: "15px",
                }}
                onClick={() => {
                  openLighboxOnSlide(index + 1);
                }}
              />
            );
          })}
          <FsLightbox
            toggler={lightboxController.toggler}
            sources={props.user.photosUrls.map((photo) => {
              return (
                <img
                  src={photo.url}
                  alt="Image4"
                  width={"850px"}
                  height={"850px"}
                />
              );
            })}
            slide={lightboxController.slide}
          />
        </Container>
      </Card>
      <Container className="container-desc-compat">
        <Card className="card-desc">
          <CardTitle tag="h2" style={{ margin: "20px" }}>
            Description
          </CardTitle>
          {props.user.user.description ? (
            <CardText style={{ margin: "20px" }}>
              {props.user.user.description}
            </CardText>
          ) : (
            <CardText style={{ margin: "20px" }}>
              Unfortunately this user dosen't have a description. Don't worry,
              if you both decide to play together you can find out more about
              him thorugh chatting
            </CardText>
          )}
        </Card>
        <Card className="card-compat">
          <CardTitle tag="h2" style={{ margin: "20px" }}>
            Compatibility
          </CardTitle>
          {commonGamesLoaded && commonGames && commonGames.length != 0 ? (
            <Container>
              <CardText style={{ textAlign: "center", marginTop: "20px" }}>
                Good news! You both have some games that you can enjoy together
              </CardText>
              <CardText style={{ textAlign: "center" }}>
                Here are the games that you both like
              </CardText>
              <Container className="common-games-container">
                {commonGames.map((element) => {
                  return (
                    <Container className="game-dashboard" key={element.id}>
                      {element.name}
                    </Container>
                  );
                })}
              </Container>
            </Container>
          ) : (
            <CardText style={{ textAlign: "center", margin: "20px" }}>
              We couldn't find any common games between the two of you, don't
              worry, you can still talk thorugh our chat and find out if you
              want to play something new together{" "}
            </CardText>
          )}
        </Card>
      </Container>
    </Container>
  ) : (
    <Container
      style={{
        textAlign: "center",
        margin: "200px",
        marginBottom: "300px",
        fontSize: "30px",
      }}
    >
      Oops, there are no more available users right now. Try again later to find
      new players to enjoy your games with!
    </Container>
  );
}

export default DashboardPerson;
