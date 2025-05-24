import React from "react";
import { useNavigate } from "react-router-dom";

function Auth(props: { element: React.ReactNode }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (localStorage.getItem("apiToken") != null) {
      navigate("/dashboard");
    }
  });

  return <>{props.element}</>;
}

export default Auth;
