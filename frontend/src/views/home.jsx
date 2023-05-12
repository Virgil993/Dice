import React from 'react';
import "../styles/home.css"
import Footer from '../components/Footer';
import HeaderHero from '../components/HeaderHero';
import { Button, Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

function Home(){

    const navigate = useNavigate()

    return (
        <div className='home-body' style={{backgroundColor:"#ddead1"}}>
        <div className='home'>
        <HeaderHero/>
        <Container className='signup-container'>
            <Container className='welcome-text'>
                <h1 className='welcome-hero'>
                    Welcome to Dice
                </h1>
            </Container>
            <Container className='signup-button-container'>
            <Button  className='signup-button' color='success' size="lg" onClick={(e)=>{
                e.preventDefault();
                navigate("/auth/register")
            }}>Sign up</Button>
            </Container>
        </Container>
        </div>          
        <Footer/>
        </div>
    );
}

export default Home;
