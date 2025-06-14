import "../styles/forgot_password.css";
import {
  Button,
  Container,
  FormGroup,
  Label,
  Input,
  Alert,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "reactstrap";
import diceLogo from "../assets/LOGO-3.webp";
import { AiFillCheckCircle } from "react-icons/ai";
import { useState, type MouseEvent } from "react";
import { isValidEmail } from "@/utils/validation";
import { sendPasswordResetEmail } from "@/apiAxios";
import {
  ResponseStatus,
  type SendPasswordResetEmailRequest,
} from "@/models/request";

function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!email) {
      setError("Email is mandatory to continue!");
      const element = document.getElementById("email-forgot-password");
      element!.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!isValidEmail(email)) {
      setError("Email is invalid!");
      const element = document.getElementById("email-forgot-password");
      element!.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const payload: SendPasswordResetEmailRequest = {
      email: email,
    };
    const res = await sendPasswordResetEmail(payload);
    if (res.data.status === ResponseStatus.SUCCESS) {
      setError("");
      setEmailSent(true);
    } else {
      setError(res.data.message || "Unknown error, please try again later");
      console.error("Error sending password reset email:", res.data.message);
      return;
    }
  }

  return (
    <div className="forgot-password-body">
      <header className="header-forgot-password">
        <Container className="header-logo">
          <img src={diceLogo} alt="No photo here" className="header-logo-img" />
        </Container>
      </header>
      <Container className="card-container">
        <div style={{ width: "100%" }}>
          <a href="/auth/login" style={{ fontWeight: "bold", color: "green" }}>
            Back to sign in
          </a>
        </div>
        {emailSent ? (
          <Container
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              flexDirection: "column",
              gap: "15px",
              margin: "30px",
            }}
          >
            <AiFillCheckCircle size={60} color="#198754"></AiFillCheckCircle>
            <div>Email sent successfully</div>
            <div>Be sure to also check your spam folder</div>
          </Container>
        ) : (
          <Card className="main-card">
            <CardHeader tag="h3">Forgot password?</CardHeader>
            <CardBody
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                Enter the email address associated with your Dice account.
              </div>
              <div>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email-forgot-password"
                    value={email}
                    className="input-forgot-password"
                    placeholder="Email"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value == "") {
                        setError("Email is mandatory to continue!");
                      } else if (!isValidEmail(e.target.value)) {
                        setError("Email is invalid!");
                      } else {
                        setError("");
                      }
                    }}
                  />
                  <Alert
                    isOpen={error !== ""}
                    color="danger"
                    style={{ marginTop: "10px" }}
                  >
                    {error}
                  </Alert>
                </FormGroup>
              </div>
            </CardBody>
            <CardFooter
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                color="success"
                style={{ width: "50%", margin: "10px" }}
                onClick={handleSubmit}
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default ForgotPassword;
