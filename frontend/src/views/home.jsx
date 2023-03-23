import React from 'react';
import "../styles/home.css"
import Footer from '../components/Footer';
import HeaderHero from '../components/HeaderHero';
import { Button, Container } from 'reactstrap';

function Home(){
    return (
        <div className='home_body'>
        <div className='home'>
        <HeaderHero/>
        <Container className='signup-container'>
            <Container className='welcome-text'>
                <h1 className='welcome-hero'>
                    Welcome to Dice
                </h1>
            </Container>
            <Container className='signup-button-container'>
            <Button  className='signup-button' color='success' size="lg">Sign up</Button>
            </Container>
        </Container>
        </div>          
        <Footer/>
        </div>
    );
}

export default Home;
