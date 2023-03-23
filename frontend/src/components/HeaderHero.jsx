import React from "react";
import "../styles/header_hero.css"
import { Container,Button } from "reactstrap";
import diceLogo from "../assets/diceLogoTest.webp"

function HeaderHero() {
    return (
        <header className="header-hero">
            <Container className="header-logo">
            <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
            </Container>
            <Container className="login-container">
            <Button  className="login-button" color="success" size="lg">Log in</Button>
            </Container>
        </header>
    )
}

export default HeaderHero