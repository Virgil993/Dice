import React from "react";
import { Container } from "reactstrap";
import '../styles/game_register.css'


function GameRegister(props) {
    if(props.isSelected){
        return <Container className="game_register" style={{backgroundColor:"rgb(98, 204, 137)"}} onClick={props.onClick}>{props.name}</Container>
    }
    return (
        <Container className="game_register" style={{backgroundColor:"rgb(186, 184, 184)"}} onClick={props.onClick}>{props.name}</Container> 
    )
}

export default GameRegister;