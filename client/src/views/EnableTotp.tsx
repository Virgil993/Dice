import { generateTotp } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";
import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "reactstrap";

function EnableTotp() {
  const navigate = useNavigate();

  const [totpUrl, setTotpUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const fetchTotpUrl = async () => {
      const response = await generateTotp();
      if (response.data.status === ResponseStatus.ERROR) {
        toast.error(response.data.message);
        setInterval(() => {
          navigate("/profile");
        }, 3000);
      } else {
        setTotpUrl(response.data.otpauthUrl);
      }
    };

    if (!totpUrl) fetchTotpUrl();
  }, [totpUrl]);

  useEffect(() => {
    const generateQrCode = async () => {
      const dataUrl = await toDataURL(totpUrl);
      setQrCodeUrl(dataUrl);
    };

    if (totpUrl && !qrCodeUrl) {
      generateQrCode();
    }
  }, [totpUrl, qrCodeUrl]);

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Enable Two Factor Authentication</h1>
      <p className="mb-4">
        To enhance your account security, please enable Two-Factor
        Authentication
      </p>
      <p className="mb-4">
        Scan the QR code with your authenticator app and click on next to enter
        the generated code.
      </p>
      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="mb-4" />}
      <Button
        color="success"
        style={{ fontSize: "1rem", padding: "10px 15px" }}
        onClick={() => {
          if (totpUrl) {
            navigate("/test-totp", { state: { totpUrl } });
          } else {
            toast.error("Failed to generate TOTP URL. Please try again.");
          }
        }}
      >
        {" "}
        Next{" "}
      </Button>
    </Container>
  );
}

export default EnableTotp;
