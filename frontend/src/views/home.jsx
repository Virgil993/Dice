import React from 'react';
import backgroundImage from '../assets/home_hero.webp'
import "../styles/home.css"


function Home(){
    return (
        <div className='home'>
            <img src={backgroundImage} className="img_background_hero"></img>
        </div>
    );
}

export default Home;
