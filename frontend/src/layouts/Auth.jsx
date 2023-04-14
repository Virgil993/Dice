import React from "react";
import { useNavigate } from "react-router-dom";

function Auth(props) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem("apiToken") != null) {
      navigate("/admin/dashboard");
    }
  });

  return <>{props.element}</>;
}

export default Auth;
