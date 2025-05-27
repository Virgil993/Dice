import { resetPassword } from "@/apiAxios";
import { ResponseStatus, type ResetPasswordRequest } from "@/models/request";
import { useState, type MouseEvent } from "react";
import diceLogo from "../assets/LOGO-3.webp";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Container,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { AiFillCheckCircle } from "react-icons/ai";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [resetPasswordSent, setResetPasswordSent] = useState<boolean>(false);

  async function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (password1 !== password2) {
      setError("Passwords do not match!");
      return;
    }
    if (!password1 || !password2) {
      setError("Both fields are mandatory!");
      return;
    }
    if (password1.length <= 9 || password2.length <= 9) {
      setError("Password must have at least 10 caracters");
      return;
    }
    setError("");

    const payload: ResetPasswordRequest = {
      password: password1,
    };
    const resPass = await resetPassword(
      userId as string,
      token as string,
      payload
    );
    if (resPass.data.status === ResponseStatus.SUCCESS) {
      toast.success("Password reset successfully!");
      setResetPasswordSent(true);
    } else {
      console.log("Error at reset password", resPass.data.message);
      setError(resPass.data.message || "Unknown error, please try again later");
      return;
    }
  }

  return (
    <div className="reset-password-body">
      <header className="header-reset-password">
        <Container className="header-logo">
          <img src={diceLogo} alt="No photo here" className="header-logo-img" />
        </Container>
      </header>

      <Container className="card-container">
        <div style={{ width: "100%" }}>
          <a href="/auth/login" style={{ fontWeight: "bold", color: "green" }}>
            sign in
          </a>
        </div>
        {resetPasswordSent ? (
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
            <div>Your password has been reset</div>
          </Container>
        ) : (
          <Card className="main-card">
            <CardHeader tag="h3">Reset password</CardHeader>
            <CardBody
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                Please enter your new password, note that it must be at least 10
                characters long.
              </div>
              <div style={{ width: "90%" }}>
                <FormGroup>
                  <Label for="password">New Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={password1}
                    placeholder="Write your password here"
                    onChange={(e) => {
                      setPassword1(e.target.value);
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password">Repeat Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={password2}
                    placeholder="Write your password again"
                    onChange={(e) => {
                      setPassword2(e.target.value);
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
                Reset password
              </Button>
            </CardFooter>
          </Card>
        )}
      </Container>
    </div>
  );
}

export default ResetPassword;
