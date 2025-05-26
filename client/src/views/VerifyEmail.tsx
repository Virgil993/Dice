import { verifyEmail } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "reactstrap";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifyEmailHelper() {
      console.log("Verifying email with token:", token, "and userId:", userId);
      if (!token || !userId) {
        console.log("");
        console.error("Invalid token or userId");
        navigate("/auth/login");
        return;
      }
      const response = await verifyEmail(userId as string, token as string);
      if (response.data.status === ResponseStatus.SUCCESS) {
        toast.success("Email verified successfully!");
        setIsLoading(false);
      } else {
        toast.error(response.data.message);
        console.error("Error verifying email:", response.data.message);
        navigate("/auth/login");
      }
    }

    verifyEmailHelper();
  }, [navigate, token, userId]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      {isLoading ? (
        <h1>Verifying your email...</h1>
      ) : (
        <div>
          <h1>Email verification complete!</h1>
          <Button color="link" onClick={() => navigate("/dashboard")}>
            Go to Dasboard
          </Button>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;
