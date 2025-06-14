import React, { useState } from "react";
import "../styles/login.css";
import {
  Button,
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
} from "reactstrap";
import diceLogo from "../assets/LOGO-3.webp";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "@/utils/validation";
import { loginUser } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errorEmail, setErrorEmail] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [errorGeneral, setErrorGeneral] = useState<string>("");

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (email == "") {
      setErrorEmail("Email is mandatory!");
      const element = document.getElementById("email-login");
      element!.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!isValidEmail(email)) {
      setErrorEmail("Email is invalid!");
      const element = document.getElementById("email-login");
      element!.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (password == "") {
      setErrorPassword("Password is mandatory!");
      const element = document.getElementById("password-login");
      element!.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const res = await loginUser({
      email: email,
      password: password,
    });
    if (res.data.status === ResponseStatus.SUCCESS) {
      if (res.data.totpRequired) {
        localStorage.setItem("totpTempToken", res.data.token);
        navigate("/auth/totp");
      } else {
        localStorage.setItem("apiToken", res.data.token);
        localStorage.setItem("userId", res.data.user!.id);

        navigate("/dashboard");
      }
    } else {
      setErrorGeneral(res.data.message);
      console.error("Error logging in:", res.data.message);
      return;
    }
  }

  return (
    <div className="login-body">
      <header className="header-login">
        <Container className="header-logo">
          <img src={diceLogo} alt="No photo here" className="header-logo-img" />
        </Container>
      </header>
      <Container className="card-container">
        <Card className="card-form">
          <Form>
            <CardHeader>
              <CardTitle tag="h3">Sign in</CardTitle>
            </CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  id="email-login"
                  value={email}
                  className="input-login-text"
                  placeholder="Email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value == "") {
                      setErrorEmail("Email is mandatory!");
                    } else if (!isValidEmail(e.target.value)) {
                      setErrorEmail("Email is invalid!");
                    } else {
                      setErrorEmail("");
                    }
                  }}
                />
                <Alert
                  isOpen={errorEmail !== ""}
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
                  name="password"
                  id="password-login"
                  value={password}
                  className="input-login-text"
                  placeholder="Password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (e.target.value == "") {
                      setErrorPassword("Password is mandatory!");
                    } else {
                      setErrorPassword("");
                    }
                  }}
                />
                <Alert
                  isOpen={errorPassword !== ""}
                  color="danger"
                  style={{ marginTop: "10px" }}
                >
                  {errorPassword}
                </Alert>
              </FormGroup>
              <Container style={{ marginTop: "20px", paddingLeft: "0px" }}>
                <a
                  href="/forgot-password"
                  style={{ fontWeight: "bold", color: "green" }}
                >
                  Forgot password?
                </a>
              </Container>
            </CardBody>
            <CardFooter style={{ display: "flex", flexDirection: "column" }}>
              <Button
                className="continue-button"
                color="success"
                size="lg"
                style={{ marginTop: "10px", marginBottom: "20px" }}
                onClick={(e) => {
                  handleSubmit(e);
                }}
              >
                Continue
              </Button>
              <Alert
                isOpen={errorGeneral !== ""}
                color="danger"
                style={{ marginTop: "10px" }}
              >
                {errorGeneral}
              </Alert>
              <span>
                Don't have an account?{" "}
                <a
                  href="/auth/register"
                  style={{ fontWeight: "bold", color: "green" }}
                >
                  Register
                </a>
              </span>
            </CardFooter>
          </Form>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
