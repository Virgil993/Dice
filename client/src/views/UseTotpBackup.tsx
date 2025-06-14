import { verifyBackupCode } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Container, Input } from "reactstrap";

function UseTotpBackup() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleSubmit = async () => {
    if (!code) {
      toast.error("Please enter a valid backup code.");
      return;
    }
    const res = await verifyBackupCode({ code });
    if (res.data.status === ResponseStatus.ERROR) {
      toast.error(res.data.message);
    } else {
      toast.success("Backup Code used successfully!");
      localStorage.setItem("apiToken", res.data.token);
      navigate("/dashboard");
    }
  };

  return (
    <Container>
      <h1 className="text-center mt-5">
        If you lost access to your authenticator app, please use a backup code
        to regain access to your account.
      </h1>
      <p className="text-center mt-3">
        Please enter one of your backup codes to verify your identity and regain
        access to your account.
      </p>
      <Input
        type="text"
        placeholder="Enter Backup Code"
        className="mt-3"
        onChange={(e) => setCode(e.target.value)}
        value={code}
        autoFocus
      />
      <Button color="success" className="mt-3" onClick={handleSubmit}>
        Submit
      </Button>

      <p className="text-center mt-3">
        If you don't have a backup code, please contact support to regain access
        to your account.
      </p>
      <p className="text-center mt-3">
        We reccommend you to disable Two-Factor Authentication on your account
        once you regain access, and then re-enable it to set up a new
        authenticator app.
      </p>
    </Container>
  );
}

export default UseTotpBackup;
