import "../styles/header_hero.css";
import diceLogo from "../assets/LOGO-3.webp";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "@chakra-ui/react";

function HeaderHero() {
  const navigate = useNavigate();

  return (
    <header className="header-hero">
      <Container className="header-logo">
        <img src={diceLogo} alt="No photo here" className="header-logo-img" />
      </Container>
      <Container className="login-container">
        <Button
          className="login-button"
          color="success"
          size="lg"
          onClick={(e) => {
            e.preventDefault();
            navigate("/auth/login");
          }}
        >
          Log in
        </Button>
      </Container>
    </header>
  );
}

export default HeaderHero;
