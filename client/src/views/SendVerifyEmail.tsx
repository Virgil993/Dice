import { sendVerificationEmail } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button, Container } from "reactstrap";

function SendVerifyEmail() {
  const [error, setError] = useState<string>("");

  async function handleResendEmail() {
    const res = await sendVerificationEmail();
    if (res.data.status === ResponseStatus.SUCCESS) {
      toast.success("Verification email sent successfully!");
    } else {
      setError(res.data.message);
      console.error("Error sending verification email:", res.data.message);
    }
  }

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError("");
    }
  }, [error]);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Verify Your Email</h1>
      <p className="text-center">
        Please check your email for a verification link. Click the link to
        verify your email address and complete the registration process.
      </p>
      <p className="text-center">
        If you haven't received the email, please check your spam folder or{" "}
      </p>
      <Button color="link" onClick={handleResendEmail}>
        click here to resend the verification email.
      </Button>
    </Container>
  );
}

export default SendVerifyEmail;
