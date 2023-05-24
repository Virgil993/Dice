import React from "react";
import "../styles/header_hero.css"
import { Container,Button } from "reactstrap";
// import diceLogo from "../assets/diceLogoTest.webp"
// import diceLogo from '../assets/logo-450x300.webp'
import diceLogo from '../assets/LOGO-3.webp'
import { useNavigate } from "react-router-dom";

function HeaderHero() {

    const navigate = useNavigate();

    return (
        <header className="header-hero">
            <Container className="header-logo">
            <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
            </Container>
            <Container className="login-container">
            <Button  className="login-button" color="success" size="lg" onClick={(e)=>{
                e.preventDefault()
                navigate("/auth/login")
            }}>Log in</Button>
            </Container>
        </header>
    )
}

export default HeaderHero