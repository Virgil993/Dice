import { getGames, registerUser } from "@/apiAxios";
import type { Game } from "@/models/game";
import { ResponseStatus, type UserCreateRequest } from "@/models/request";
import "../styles/register.css";
import { acceptedFileTypesPhotos, convertFromBlobToFile } from "@/utils/photos";
import { calculateAge, isValidEmail } from "@/utils/validation";
import imageCompression from "browser-image-compression";
import { useEffect, useState } from "react";
import closeIconLogo from "../assets/closePhotoIcon.svg";
import addIconLogo from "../assets/addPhotoIcon.svg";
import GameRegister from "../components/GameRegister";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
} from "reactstrap";
import Footer from "@/components/Footer";

function Register() {
  const navigate = useNavigate();

  const [image1, setImage1] = useState<string>("");
  const [photo1Border, setPhoto1Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image2, setImage2] = useState<string>("");
  const [photo2Border, setPhoto2Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image3, setImage3] = useState<string>("");
  const [photo3Border, setPhoto3Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image4, setImage4] = useState<string>("");
  const [photo4Border, setPhoto4Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image5, setImage5] = useState<string>("");
  const [photo5Border, setPhoto5Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image6, setImage6] = useState<string>("");
  const [photo6Border, setPhoto6Border] = useState<string>(
    "2px dashed rgb(58, 58, 66)"
  );

  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  const [image3File, setImage3File] = useState<File | null>(null);
  const [image4File, setImage4File] = useState<File | null>(null);
  const [image5File, setImage5File] = useState<File | null>(null);
  const [image6File, setImage6File] = useState<File | null>(null);

  const [gamesSelected, setGamesSelected] = useState<Game[]>([]);
  const [availableGames, setAvailableGames] = useState<Game[]>([]);

  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [errorFirstName, setErrorFirstName] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [errorPassword1, setErrorPassword1] = useState<string | null>(null);
  const [errorPassword2, setErrorPassword2] = useState<string | null>(null);
  const [errorBirthday, setErrorBirthday] = useState<string | null>(null);
  const [errorGender, setErrorGender] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const [validContinue, setValidContinue] = useState<boolean>(false);

  useEffect(() => {
    let numberOfImages = 0;
    if (image1File) {
      numberOfImages = numberOfImages + 1;
    }
    if (image2File) {
      numberOfImages = numberOfImages + 1;
    }
    if (image3File) {
      numberOfImages = numberOfImages + 1;
    }
    if (image4File) {
      numberOfImages = numberOfImages + 1;
    }
    if (image5File) {
      numberOfImages = numberOfImages + 1;
    }
    if (image6File) {
      numberOfImages = numberOfImages + 1;
    }
    if (gamesSelected.length >= 5 && numberOfImages >= 2) {
      setValidContinue(true);
    } else {
      setValidContinue(false);
    }
  }, [
    image1File,
    image2File,
    image3File,
    image4File,
    image5File,
    image6File,
    gamesSelected,
    validContinue,
  ]);

  useEffect(() => {
    // Fetch available games from the API
    const fetchAvailableGames = async () => {
      try {
        const response = await getGames();
        if (
          response.status !== 200 ||
          response.data.status !== ResponseStatus.SUCCESS
        ) {
          setErrorGeneral("Failed to fetch games. Please try again later.");
          return;
        }
        const data: Game[] = response.data.games;
        setAvailableGames(data);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchAvailableGames();
  }, []);

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setErrorFirstName(null);
    setErrorEmail(null);
    setErrorPassword1(null);
    setErrorPassword2(null);
    setErrorBirthday(null);
    setErrorGender(null);
    setErrorGeneral(null);
    if (firstName == "") {
      setErrorFirstName("First name is required!");
      const element = document.getElementById("first-name-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (email == "") {
      setErrorEmail("Email is mandatory!");
      const element = document.getElementById("email-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!isValidEmail(email)) {
      setErrorEmail("Email is invalid!");
      const element = document.getElementById("email-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (password1 == "") {
      setErrorPassword1("Password is mandatory!");
      const element = document.getElementById("password1-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (password1.length <= 9) {
      setErrorPassword1("Password must have at least 10 characters!");
      const element = document.getElementById("password1-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (password2 !== password1) {
      setErrorPassword2("Passwords do not match!");
      const element = document.getElementById("password2-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (password2 == "") {
      setErrorPassword2("Password is mandatory!");
      const element = document.getElementById("password2-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (birthday == "") {
      setErrorBirthday("Birthday is mandatory!");
      const element = document.getElementById("birthday-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (calculateAge(birthday) < 18) {
      setErrorBirthday("You need to be at least 18 years old to use this app!");
      const element = document.getElementById("birthday-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (gender == "") {
      setErrorGender("Gender is mandatory!");
      const element = document.getElementById("gender-register");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const imageFiles: File[] = [];

    if (image1File !== null) imageFiles.push(image1File);
    if (image2File !== null) imageFiles.push(image2File);
    if (image3File !== null) imageFiles.push(image3File);
    if (image4File !== null) imageFiles.push(image4File);
    if (image5File !== null) imageFiles.push(image5File);
    if (image6File !== null) imageFiles.push(image6File);

    const payload: UserCreateRequest = {
      name: firstName,
      email: email,
      password: password1,
      birthday: birthday,
      gender: gender,
      description: description,
      gameIds: gamesSelected.map((game) => game.id),
    };

    const formData = new FormData();
    formData.append("user", JSON.stringify(payload));
    imageFiles.forEach((file) => {
      formData.append(`files`, file);
    });

    const response = await registerUser(formData);
    if (
      response.status === 201 &&
      response.data.status === ResponseStatus.SUCCESS
    ) {
      // Registration successful, redirect to login page
      navigate("/auth/login");
    } else if (response.data.status === ResponseStatus.ERROR) {
      // Registration failed, show error message
      setErrorGeneral(response.data.message);
    } else {
      // Unexpected error, show a generic error message
      setErrorGeneral("An unexpected error occurred. Please try again later.");
    }
  }

  return (
    <div className="register-body">
      <Form className="register-form">
        <Container className="title-form">
          <h1>Create an account</h1>
        </Container>
        <Container className="form-flexbox-1">
          <Container>
            <FormGroup>
              <Label for="firstName">First Name</Label>
              <Input
                type="text"
                name="name"
                id="first-name-register"
                value={firstName}
                className="input-register-text"
                placeholder="First Name"
                onChange={(e) => {
                  if (e.target.value == "") {
                    setFirstName(e.target.value);
                    setErrorFirstName("First name is required!");
                  } else {
                    setErrorFirstName(null);
                    setFirstName(e.target.value);
                  }
                }}
              />
              <Alert
                isOpen={errorFirstName != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorFirstName}
              </Alert>
            </FormGroup>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email"
                id="email-register"
                value={email}
                className="input-register-text"
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value == "") {
                    setErrorEmail("Email is mandatory!");
                  } else if (!isValidEmail(e.target.value)) {
                    setErrorEmail("Email is invalid!");
                  } else {
                    setErrorEmail(null);
                  }
                }}
              />
              <Alert
                isOpen={errorEmail != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorEmail}
              </Alert>
            </FormGroup>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password1"
                value={password1}
                id="password1-register"
                className="input-register-text"
                placeholder="Password"
                onChange={(e) => {
                  setPassword1(e.target.value);
                  if (e.target.value == "") {
                    setErrorPassword1("Password is mandatory!");
                  } else if (e.target.value.length < 10) {
                    setErrorPassword1(
                      "Password must have at least 10 characters!"
                    );
                  } else {
                    setErrorPassword1(null);
                  }
                }}
              />
              <Alert
                isOpen={errorPassword1 != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorPassword1}
              </Alert>
            </FormGroup>
            <FormGroup>
              <Label for="password">Confirm Password</Label>
              <Input
                type="password"
                name="password2"
                value={password2}
                id="password2-register"
                className="input-register-text"
                placeholder="Write Your Password Again"
                onChange={(e) => {
                  setPassword2(e.target.value);
                  if (e.target.value != password1) {
                    setErrorPassword2("Passwords do not match!");
                  } else if (e.target.value == "") {
                    setErrorPassword2("Password is mandatory!");
                  } else {
                    setErrorPassword2(null);
                  }
                }}
              />
              <Alert
                isOpen={errorPassword2 != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorPassword2}
              </Alert>
            </FormGroup>
            <FormGroup>
              <Label for="birthday">Birthday</Label>
              <Input
                type="date"
                name="date"
                id="birthday-register"
                value={birthday}
                className="input-register-text"
                placeholder="date placeholder"
                onChange={(e) => {
                  setBirthday(e.target.value);
                  if (e.target.value == "") {
                    setErrorBirthday("Birthday is mandatory");
                  } else if (calculateAge(e.target.value) < 18) {
                    setErrorBirthday(
                      "You need to be at least 18 years old to use this app!"
                    );
                  } else {
                    setErrorBirthday(null);
                  }
                }}
              />
              <Alert
                isOpen={errorBirthday != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorBirthday}
              </Alert>
            </FormGroup>
            <FormGroup
              id="gender-register"
              tag="fieldset"
              onChange={(e) => {
                // @ts-expect-error event.target.value is a string
                setGender(e.target.value.toLowerCase());
              }}
            >
              <legend>Gender</legend>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    value={"Male"}
                    className="input-register-text"
                    name="radio1"
                  />{" "}
                  Male
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    value={"Female"}
                    className="input-register-text"
                    name="radio1"
                  />{" "}
                  Female
                </Label>
              </FormGroup>
              <Alert
                isOpen={errorGender != null}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorGender}
              </Alert>
            </FormGroup>
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="textarea"
                name="description"
                id="description-register"
                value={description}
                className="input-register-text"
                placeholder="Describe yourself in a few words"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
              <FormText color="muted">
                Adding a description significantly improves your chances of
                being picked by other players to join their games
              </FormText>
            </FormGroup>
          </Container>
          <Container className="right-side-container">
            <Label>Photos</Label>
            <Container className="photo-upload-container">
              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo1Border }}
                onClick={() => {
                  if (!image1) {
                    // @ts-expect-error document is not null
                    document?.querySelector(".photo1-upload-register")?.click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo1-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage1(URL.createObjectURL(event.target.files[0]));
                      setPhoto1Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage1File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image1 ? (
                  <img
                    src={image1}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image1 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage1File(null);
                      setImage1("");
                      setPhoto1Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>

              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo2Border }}
                onClick={() => {
                  if (!image2) {
                    // @ts-expect-error document is not null
                    document.querySelector(".photo2-upload-register").click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo2-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage2(URL.createObjectURL(event.target.files[0]));
                      setPhoto2Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage2File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image2 ? (
                  <img
                    src={image2}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image2 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage2File(null);
                      console.log(image2File);
                      setImage2("");
                      setPhoto2Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>

              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo3Border }}
                onClick={() => {
                  if (!image3) {
                    // @ts-expect-error document is not null
                    document.querySelector(".photo3-upload-register").click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo3-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage3(URL.createObjectURL(event.target.files[0]));
                      setPhoto3Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage3File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image3 ? (
                  <img
                    src={image3}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image3 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage3File(null);
                      setImage3("");
                      setPhoto3Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>

              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo4Border }}
                onClick={() => {
                  if (!image4) {
                    // @ts-expect-error document is not null
                    document.querySelector(".photo4-upload-register").click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo4-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage4(URL.createObjectURL(event.target.files[0]));
                      setPhoto4Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage4File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image4 ? (
                  <img
                    src={image4}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image4 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage4File(null);
                      setImage4("");
                      setPhoto4Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>
              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo5Border }}
                onClick={() => {
                  if (!image5) {
                    // @ts-expect-error document is not null
                    document.querySelector(".photo5-upload-register").click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo5-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage5(URL.createObjectURL(event.target.files[0]));
                      setPhoto5Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage5File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image5 ? (
                  <img
                    src={image4}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image5 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage5File(null);
                      setImage5("");
                      setPhoto5Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>
              <FormGroup
                className="file-upload-form-group"
                style={{ border: photo6Border }}
                onClick={() => {
                  if (!image6) {
                    // @ts-expect-error document is not null
                    document.querySelector(".photo6-upload-register").click();
                  }
                }}
              >
                <Input
                  type="file"
                  accept="image/*"
                  className="photo6-upload-register"
                  hidden
                  onChange={async (event) => {
                    event.preventDefault();
                    if (
                      event.target.files &&
                      acceptedFileTypesPhotos.includes(
                        event.target.files[0].type
                      )
                    ) {
                      setImage6(URL.createObjectURL(event.target.files[0]));
                      setPhoto6Border("hidden");
                      const options = {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 1024,
                      };
                      try {
                        const compressedBlob = await imageCompression(
                          event.target.files[0],
                          options
                        );
                        const name = event.target.files[0].name;
                        const type = event.target.files[0].type;

                        const compressedFile = convertFromBlobToFile(
                          compressedBlob,
                          name,
                          type
                        );
                        setImage6File(compressedFile);
                      } catch (error) {
                        console.log(error);
                      }
                    }
                  }}
                />
                {image6 ? (
                  <img
                    src={image6}
                    width={"100%"}
                    height={"100%"}
                    className="photo-register"
                  />
                ) : (
                  <img
                    src={addIconLogo}
                    className="add-photo-icon"
                    style={{ cursor: "pointer" }}
                  />
                )}
                {image6 ? (
                  <img
                    src={closeIconLogo}
                    className="remove-photo-icon"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setImage6File(null);
                      setImage6("");
                      setPhoto6Border("2px dashed rgb(58, 58, 66)");
                    }}
                  />
                ) : (
                  <></>
                )}
              </FormGroup>
            </Container>
            <Container style={{ textAlign: "center" }}>
              Add at least 2 photos to continue
            </Container>
          </Container>
        </Container>
        <Container
          style={{
            textAlign: "center",
            fontSize: "30px",
            marginBottom: "30px",
          }}
        >
          What games do you play?
        </Container>
        <Container className="games-container-register">
          {availableGames.map((element) => (
            <GameRegister
              key={element.id}
              name={element.name}
              isSelected={
                gamesSelected.find((game) => game.id === element.id) !==
                undefined
              }
              onClick={() => {
                if (
                  gamesSelected.find((game) => game.id === element.id) !==
                  undefined
                ) {
                  const newlist = [...gamesSelected];
                  const result = newlist.filter(
                    (game) => game.id != element.id
                  );
                  setGamesSelected(result);
                } else {
                  const newlist = [...gamesSelected];
                  newlist.push(element);
                  setGamesSelected(newlist);
                }
              }}
            ></GameRegister>
          ))}
          <Container
            style={{ textAlign: "center", marginTop: "20px", fontSize: "20px" }}
          >
            Choose at least 5 games to continue
          </Container>
        </Container>
        <Alert
          isOpen={errorGeneral != null}
          color="danger"
          style={{ marginTop: "10px" }}
        >
          {errorGeneral}
        </Alert>
        <Container className="continue-button-container">
          {validContinue ? (
            <Button
              className="continue-button"
              color="success"
              size="lg"
              onClick={(e) => {
                handleSubmit(e);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="continue-button"
              size="lg"
              style={{ cursor: "auto" }}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Continue
            </Button>
          )}
        </Container>
        <Container className="login-link">
          Already have an account?
          <a href="/auth/login">Log in here</a>
        </Container>
      </Form>
      <Footer />
    </div>
  );
}

export default Register;
