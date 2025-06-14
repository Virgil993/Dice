import { getUser } from "@/apiAxios";
import { ResponseStatus } from "@/models/request";
import React from "react";
import { useNavigate } from "react-router-dom";

function Admin(props: { element: React.ReactNode }) {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string>("");

  React.useEffect(() => {
    if (localStorage.getItem("apiToken") === null) {
      localStorage.clear();
      navigate("/auth/home");
      return;
    }
    async function checkToken() {
      const res = await getUser();
      if (res.data.status === ResponseStatus.SUCCESS) {
        setUserId(res.data.user.id);
      }
    }
    checkToken();
  }, [userId, navigate]);

  return <>{props.element}</>;
}

export default Admin;
