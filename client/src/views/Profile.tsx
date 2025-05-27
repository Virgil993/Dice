import React, { type MouseEvent } from "react";
import "../styles/profile.css";
import NavbarMain from "../components/Navbar";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Container,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import closeIconLogo from "../assets/closePhotoIcon.svg";
import addIconLogo from "../assets/addPhotoIcon.svg";
import imageCompression from "browser-image-compression";
import GameRegister from "../components/GameRegister";
import { BsFillDice6Fill } from "react-icons/bs";
import {
  deleteUser,
  disableTotp,
  getGames,
  getUser,
  updateUser,
} from "@/apiAxios";
import { ResponseStatus, type UserUpdateRequest } from "@/models/request";
import type { User } from "@/models/user";
import type { Game } from "@/models/game";
import { calculateAge } from "@/utils/validation";
import { acceptedFileTypesPhotos } from "@/utils/photos";
import toast from "react-hot-toast";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User>();

  const [photos, setPhotos] = React.useState<File[]>([]);
  const [updatedPhotos, setUpdatedPhotos] = React.useState<File[]>([]);
  const [photosUpdateActive, setPhotosUpdateActive] = React.useState(false);
  const [initialEditPhotos, setInitialEditPhotos] = React.useState<File[]>([]);

  const [updatedName, setUpdatedName] = React.useState("");
  const [name, setName] = React.useState("");
  const [nameUpdateActive, setNameUpdateActive] = React.useState(false);

  const [updatedGender, setUpdatedGender] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [genderUpdateActive, setGenderUpdateActive] = React.useState(false);

  const [updatedDescription, setUpdatedDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [descriptionUpdateActive, setDescriptionUpdateActive] =
    React.useState(false);

  const [updatedGames, setUpdatedGames] = React.useState<Game[]>([]);
  const [games, setGames] = React.useState<Game[]>([]);
  const [gamesUpdateActive, setGamesUpdateActive] = React.useState(false);

  const [availableGames, setAvailableGames] = React.useState<Game[]>([]);

  const [modal, setModal] = React.useState(false);
  const [totpModal, setTotpModal] = React.useState(false);

  const [navbarLoaded, setNavbarLoaded] = React.useState(false);

  const toggle = () => setModal(!modal);

  const urlToFile = async (
    url: string,
    filename: string,
    mimeType: string
  ): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  };

  const getMimeTypeFromUrl = (url: string) => {
    // Extract file extension from URL (before query params)
    const pathname = new URL(url).pathname;
    const extension = pathname.split(".").pop()?.toLowerCase();

    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      bmp: "image/bmp",
      svg: "image/svg+xml",
      tiff: "image/tiff",
      ico: "image/x-icon",
    };
    if (!extension || !(extension in mimeTypes)) {
      return "image/jpeg"; // Default fallback if no extension found
    }
    return mimeTypes[extension as keyof typeof mimeTypes];
  };
  async function loadPhotos(signedUrls: string[]) {
    const files: File[] = [];
    for (let index = 0; index < signedUrls.length; index++) {
      // Extract filename from URL or create one
      const filename =
        signedUrls[index].split("/").pop()?.split("?")[0] ||
        `photo-${index}.jpg`;
      const mimeType = getMimeTypeFromUrl(signedUrls[index]);

      const file = await urlToFile(signedUrls[index], filename, mimeType);
      files.push(file);
    }
    return files;
  }

  function padFiles(files: File[]): File[] {
    if (files.length < 6) {
      const paddedFiles = [...files];
      for (let i = files.length; i < 6; i++) {
        paddedFiles.push(
          new File([], `empty-photo-${i}.jpg`, { type: "image/jpeg" })
        );
      }
      return paddedFiles;
    }
    return files;
  }

  React.useEffect(() => {
    async function loadUser() {
      const res = await getUser();
      if (res.data.status === ResponseStatus.SUCCESS) {
        const photoFiles = await loadPhotos(
          res.data.photosUrls.map((photo) => photo.url)
        );
        const paddedPhotos = padFiles(photoFiles);
        setUpdatedPhotos(paddedPhotos);

        setDescription(res.data.user.description);
        setUser(res.data.user);
        setPhotos(paddedPhotos);
        setName(res.data.user.name);
        setGender(res.data.user.gender);
        setGames(res.data.games);
      }
    }

    if (!user) {
      console.log("Loading user data...");
      loadUser();
    }
  }, [user]);

  React.useEffect(() => {
    async function loadAvailableGames() {
      const res = await getGames();
      if (res.data.status === ResponseStatus.SUCCESS) {
        setAvailableGames(res.data.games);
      } else {
        console.error("Failed to fetch available games");
        toast.error("Failed to fetch available games: " + res.data.message);
      }
    }
    if (availableGames.length === 0) {
      loadAvailableGames();
    }
  }, [availableGames]);

  async function handleLogout(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    localStorage.clear();
    navigate("/home");
  }

  async function updateNewUser(newUser: UserUpdateRequest, files: File[]) {
    const form = new FormData();
    form.append("user", JSON.stringify(newUser));
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > 100) {
          form.append("files", files[i]);
        }
      }
    }
    const res = await updateUser(form);
    if (res.data.status === ResponseStatus.SUCCESS) {
      console.log("User updated successfully");
      setUser(res.data.user);
      const photoFilesRaw = await loadPhotos(
        res.data.photosUrls.map((photo) => photo.url)
      );
      const photoFiles = padFiles(photoFilesRaw);
      setUpdatedPhotos(photoFiles);
      setPhotos(photoFiles);
    } else {
      console.log("Error at update user");
      console.log(res.data.message);
    }
  }

  async function deleteCurrentUser() {
    const res = await deleteUser();
    if (res.data.status === ResponseStatus.SUCCESS) {
      console.log("User deleted successfully");
      toast.success("Account deleted successfully");
    }
    localStorage.clear();
    navigate("/home");
  }

  async function disableTotpFeat() {
    const res = await disableTotp();
    if (res.data.status === ResponseStatus.SUCCESS) {
      console.log("Two Factor Authentication disabled successfully");
      toast.success("Two Factor Authentication disabled successfully");
      setTotpModal(false);
      setUser((prev) => (prev ? { ...prev, totpEnabled: false } : prev));
    } else {
      console.error(
        "Error disabling Two Factor Authentication:",
        res.data.message
      );
      toast.error(
        "Failed to disable Two Factor Authentication: " + res.data.message
      );
    }
  }

  function checkColor(state: string) {
    if (state) {
      return "success";
    }
    return "secondary";
  }

  function checkPhotosColor(state: File[]) {
    let numberOfPhotos = 0;
    for (let i = 0; i < state.length; i++) {
      if (state[i].size > 100) {
        numberOfPhotos = numberOfPhotos + 1;
      }
    }
    if (numberOfPhotos >= 2) {
      return "success";
    }
    return "secondary";
  }

  function checkGamesColor(state: Game[]) {
    if (state.length >= 5) {
      return "success";
    }
    return "secondary";
  }

  return (
    <div className="profile-body">
      <NavbarMain
        page="profile"
        navbarLoaded={navbarLoaded}
        setNavbarLoaded={setNavbarLoaded}
      />
      {user && photos && name && gender && games && navbarLoaded ? (
        <Container className="profile-body-container">
          <Card className="profile-title-main">Your profile</Card>
          <Card className="profile-picture-name">
            <CardBody className="profile-picture-name-card-body">
              <Container className="img-profile-picture">
                <img src={URL.createObjectURL(photos[0])} alt="N/A" />
              </Container>
              <Container className="user-name-gender-age">
                {nameUpdateActive ? (
                  <div className="user-info-div-update">
                    <div className="user-info">
                      <div>Name: </div>
                      <Input
                        placeholder={name}
                        onChange={(e) => {
                          e.preventDefault();
                          setUpdatedName(e.target.value);
                        }}
                      ></Input>
                    </div>

                    <div className="user-info-edit-buttons">
                      <Button
                        color={checkColor(updatedName)}
                        onClick={(e) => {
                          e.preventDefault();
                          if (updatedName) {
                            updateNewUser({ name: updatedName }, photos);
                            setName(updatedName);
                            setNameUpdateActive(false);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setNameUpdateActive(false);
                        }}
                        outline
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="user-info-div">
                    <div className="user-info">
                      <div>Name: </div>
                      <div>{name}</div>
                    </div>
                    <div className="user-info-edit-buttons">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setNameUpdateActive(true);
                          setUpdatedName("");
                        }}
                        color="success"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
                {genderUpdateActive ? (
                  <div className="user-info-div-update">
                    <div className="user-info">
                      <div>Gender:</div>
                      <FormGroup
                        id="gender-profile"
                        tag="fieldset"
                        style={{
                          fontSize: "20px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "0px",
                        }}
                        onChange={(e) => {
                          // @ts-expect-error gender check with radio
                          setUpdatedGender(e.target.value.toLowerCase());
                        }}
                      >
                        <FormGroup check>
                          <Label check>
                            <Input type="radio" value={"Male"} name="radio1" />{" "}
                            Male
                          </Label>
                        </FormGroup>
                        <FormGroup check>
                          <Label check>
                            <Input
                              type="radio"
                              value={"Female"}
                              name="radio1"
                            />{" "}
                            Female
                          </Label>
                        </FormGroup>
                      </FormGroup>
                    </div>
                    <div className="user-info-edit-buttons">
                      <Button
                        color={checkColor(updatedGender)}
                        onClick={(e) => {
                          e.preventDefault();
                          if (updatedGender) {
                            updateNewUser({ gender: updatedGender }, photos);
                            setGender(updatedGender);
                            setGenderUpdateActive(false);
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setGenderUpdateActive(false);
                        }}
                        outline
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="user-info-div">
                    <div className="user-info">
                      <div>Gender:</div>
                      <div>{gender}</div>
                    </div>
                    <div className="user-info-edit-buttons">
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setGenderUpdateActive(true);
                          setUpdatedGender("");
                        }}
                        color="success"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                )}
                <div className="user-info-div">
                  Age: {calculateAge(user.birthday)}
                </div>
              </Container>
              <Container className="description-container">
                <Container className="description-title">
                  Your description
                </Container>
                {descriptionUpdateActive ? (
                  <Container className="description-content-wrapper">
                    <Input
                      className="description-content"
                      type="textarea"
                      name="text"
                      value={updatedDescription}
                      style={{ resize: "none" }}
                      onChange={(e) => {
                        e.preventDefault();
                        setUpdatedDescription(e.target.value);
                      }}
                    ></Input>
                    <div className="description-edit-buttons">
                      <Button
                        color="success"
                        onClick={(e) => {
                          e.preventDefault();
                          updateNewUser(
                            { description: updatedDescription },
                            photos
                          );
                          setDescription(updatedDescription);
                          setDescriptionUpdateActive(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        outline
                        onClick={(e) => {
                          e.preventDefault();
                          setDescriptionUpdateActive(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Container>
                ) : (
                  <Container className="description-content-wrapper">
                    <Input
                      className="description-content"
                      type="textarea"
                      name="text"
                      value={description}
                      placeholder="You don't have a description, add something to increase your chances of being picked by other players"
                      disabled
                      style={{ resize: "none" }}
                    ></Input>
                    <div className="description-edit-buttons">
                      <Button
                        color="success"
                        onClick={(e) => {
                          e.preventDefault();
                          setUpdatedDescription(description);
                          setDescriptionUpdateActive(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </Container>
                )}
              </Container>
            </CardBody>
          </Card>

          <Card className="profile-photos-card">
            <CardBody className="profile-photos-card-body">
              <Container className="photos-card-title">Your photos</Container>
              {photosUpdateActive ? (
                <Container className="photos-card-container">
                  <Container className="photos-container">
                    {updatedPhotos.map((element, index) => {
                      if (element.size > 100) {
                        return (
                          <FormGroup
                            key={index}
                            className="single-photo-container"
                          >
                            <img src={URL.createObjectURL(element)} alt="N/A" />
                            <img
                              src={closeIconLogo}
                              className="remove-photo-icon-profile"
                              onClick={(e) => {
                                e.preventDefault();
                                const newUpdatedPhotos = updatedPhotos;
                                for (
                                  let i = 0;
                                  i < newUpdatedPhotos.length;
                                  i++
                                ) {
                                  if (i === index) {
                                    newUpdatedPhotos[i] = new File(
                                      [],
                                      `empty-photo-${i}.jpg`,
                                      { type: "image/jpeg" }
                                    );
                                    break;
                                  }
                                }
                                setUpdatedPhotos([...newUpdatedPhotos]);
                              }}
                            />
                          </FormGroup>
                        );
                      }
                      return (
                        <FormGroup
                          key={index}
                          className="single-photo-container"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            document
                              .querySelector(
                                ".photo" + String(index + 1) + "-upload-profile"
                              )

                              // @ts-expect-error weird typescript error
                              ?.click();
                          }}
                        >
                          <Input
                            type="file"
                            accept="image/*"
                            className={
                              "photo" + String(index + 1) + "-upload-profile"
                            }
                            hidden
                            onChange={async (event) => {
                              event.preventDefault();
                              if (
                                event.target.files &&
                                acceptedFileTypesPhotos.includes(
                                  event.target.files[0].type
                                )
                              ) {
                                const newUpdatedPhotos = updatedPhotos;
                                const options = {
                                  maxSizeMB: 0.5,
                                  maxWidthOrHeight: 1024,
                                };
                                try {
                                  const compressedFile = await imageCompression(
                                    event.target.files[0],
                                    options
                                  );
                                  newUpdatedPhotos[index] = compressedFile;
                                  setUpdatedPhotos([...newUpdatedPhotos]);
                                } catch (error) {
                                  console.log(error);
                                }
                              }
                            }}
                          />
                          <img
                            src={addIconLogo}
                            className="add-photo-icon-profile"
                            style={{ cursor: "pointer" }}
                          />
                        </FormGroup>
                      );
                    })}
                  </Container>
                  <Container style={{ textAlign: "center" }}>
                    Please have at least two active photos to continue
                  </Container>
                  <Container className="photos-edit-buttons">
                    <Button
                      color={checkPhotosColor(updatedPhotos)}
                      onClick={(e) => {
                        e.preventDefault();
                        let numberOfPhotos = 0;
                        for (let i = 0; i < updatedPhotos.length; i++) {
                          if (updatedPhotos[i].size > 100) {
                            numberOfPhotos = numberOfPhotos + 1;
                          }
                        }
                        if (numberOfPhotos >= 2) {
                          updateNewUser({}, updatedPhotos);
                          setInitialEditPhotos([]);
                          setPhotosUpdateActive(false);
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      outline
                      onClick={(e) => {
                        e.preventDefault();
                        setPhotosUpdateActive(false);
                        setUpdatedPhotos([...initialEditPhotos]);
                        setPhotos([...initialEditPhotos]);
                        setInitialEditPhotos([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </Container>
                </Container>
              ) : (
                <Container className="photos-card-container">
                  <Container className="photos-container">
                    {photos.map((element, index) => {
                      if (element.size > 100)
                        return (
                          <img
                            src={URL.createObjectURL(element)}
                            key={index}
                            alt="N/A"
                            style={{
                              width: "150px",
                              margin: "10px",
                              height: "180px",
                              borderRadius: "15px",
                              border: "solid",
                            }}
                          />
                        );
                    })}
                  </Container>
                  <Container
                    style={{
                      textAlign: "center",
                      color: "white",
                      cursor: "default",
                    }}
                  >
                    Please have at least two active photos to continue
                  </Container>
                  <Container className="photos-edit-buttons">
                    <Button
                      color="success"
                      onClick={(e) => {
                        e.preventDefault();
                        setPhotosUpdateActive(true);
                        setInitialEditPhotos([...updatedPhotos]);
                      }}
                    >
                      Edit
                    </Button>
                  </Container>
                </Container>
              )}
            </CardBody>
          </Card>
          <Card className="games-profile-card">
            <CardTitle tag="h2">Your games</CardTitle>
            <CardBody className="profile-games-card-body">
              {gamesUpdateActive ? (
                <Container className="games-wrapper">
                  <Container className="games-container">
                    {availableGames.map((element) => {
                      console.log(availableGames.length);
                      return (
                        <GameRegister
                          key={element.id}
                          name={element.name}
                          isSelected={
                            updatedGames.find(
                              (game) => game.id === element.id
                            ) !== undefined
                          }
                          onClick={() => {
                            if (
                              updatedGames.find(
                                (game) => game.id === element.id
                              ) !== undefined
                            ) {
                              const newList = [...updatedGames];
                              const result = newList.filter(
                                (game) => game.id != element.id
                              );
                              setUpdatedGames(result);
                            } else {
                              const newlist = [...updatedGames];
                              newlist.push(element);
                              setUpdatedGames(newlist);
                            }
                          }}
                        />
                      );
                    })}
                  </Container>
                  <Container style={{ textAlign: "center" }}>
                    Please have at least 5 games selected to continue
                  </Container>
                  <Container className="games-edit-buttons">
                    <Button
                      color={checkGamesColor(updatedGames)}
                      onClick={(e) => {
                        e.preventDefault();
                        if (updatedGames.length >= 5) {
                          updateNewUser(
                            { gameIds: updatedGames.map((game) => game.id) },
                            photos
                          );
                          setGames([...updatedGames]);
                          setGamesUpdateActive(false);
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      color="secondary"
                      outline
                      onClick={(e) => {
                        e.preventDefault();
                        setGamesUpdateActive(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </Container>
                </Container>
              ) : (
                <Container className="games-wrapper">
                  <Container className="games-container">
                    {games.map((element) => {
                      return (
                        <GameRegister
                          key={element.id}
                          name={element.name}
                          onClick={() => {}}
                          isSelected={true}
                        />
                      );
                    })}
                  </Container>
                  <Container
                    style={{
                      textAlign: "center",
                      color: "white",
                      cursor: "default",
                    }}
                  >
                    Please have at least 5 games selected to continue
                  </Container>
                  <Container className="games-edit-buttons">
                    <Button
                      color="success"
                      onClick={(e) => {
                        e.preventDefault();
                        setGamesUpdateActive(true);
                        setUpdatedGames([...games]);
                      }}
                    >
                      Edit
                    </Button>
                  </Container>
                </Container>
              )}
            </CardBody>
          </Card>
          <Card className="d-flex flex-column align-items-center justify-content-center">
            <CardTitle tag="h2" className="m-3">
              Two Factor Authentication
            </CardTitle>
            {user && user.totpEnabled ? (
              <Container className="d-flex flex-column align-items-center justify-content-center">
                <Container className="d-flex flex-column align-items-center justify-content-center">
                  <p className="mb-4">Two Factor Authentication is enabled</p>
                  <Button
                    color="danger"
                    className="mb-3"
                    onClick={() => {
                      setTotpModal(true);
                    }}
                  >
                    Disable Two Factor Authentication
                  </Button>
                  <Modal
                    isOpen={totpModal}
                    toggle={() => setTotpModal(!totpModal)}
                  >
                    <ModalHeader toggle={() => setTotpModal(!totpModal)}>
                      Disable Two Factor Authentication
                    </ModalHeader>
                    <ModalBody>
                      {" "}
                      Warning! This action will disable two factor
                      authentication and you will need to re-enable it to secure
                      your account. Are you sure you want to continue?
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        onClick={(e) => {
                          e.preventDefault();
                          disableTotpFeat();
                        }}
                      >
                        Yes
                      </Button>
                      <Button onClick={() => setTotpModal(!totpModal)}>
                        No
                      </Button>
                    </ModalFooter>
                  </Modal>
                </Container>
              </Container>
            ) : (
              <CardBody className="d-flex flex-column align-items-center justify-content-center">
                <div className="profile-totp-text">
                  To enhance your account security, please enable Two-Factor
                  Authentication.
                </div>
                <Button
                  color="success"
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/enable-totp");
                  }}
                >
                  Enable
                </Button>
              </CardBody>
            )}
          </Card>
          <Card>
            <CardBody className="profile-logout-delete-buttons">
              <Button onClick={handleLogout}>Sign out</Button>
              <Button color="danger" onClick={toggle}>
                Delete Account
              </Button>
              <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Delete account</ModalHeader>
                <ModalBody>
                  {" "}
                  Warning! This action will permanently delete your account with
                  no chance to retrieve it. Are you sure you want to continue?
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteCurrentUser();
                    }}
                  >
                    Yes
                  </Button>
                  <Button onClick={toggle}>No</Button>
                </ModalFooter>
              </Modal>
            </CardBody>
          </Card>
        </Container>
      ) : (
        <Container className="loading-profile">
          <Container className="loading-icon">
            <BsFillDice6Fill size={70} />
          </Container>
          <Container className="loading-text">Loading...</Container>
        </Container>
      )}
      <Footer />
    </div>
  );
}

export default Profile;
