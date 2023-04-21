import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../backend_sdk/user.sdk";

function Admin(props) {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (
      localStorage.getItem("apiToken") === null
    ) {
      localStorage.clear();
      navigate("/auth/home");
      return
    }
    async function checkToken() {
      const res = await User.getUserByToken(localStorage.getItem("apiToken"));
      if (!res || !res.success) {
        console.log(res);
        localStorage.clear();
        navigate("/auth/home");
      }
    }
    checkToken();
  });

  return <>{props.element}</>;
}

export default Admin;
