import React from "react";
import '../styles/footer.css'
import { Container } from "reactstrap";
// import diceLogo from "../assets/diceLogoTest.webp"
import diceLogo from '../assets/logo-450x300.webp'

function Footer(){
    return (
        <footer className="footer">
            <Container className="footer-logo">
                <img src={diceLogo} alt="No photo here" className="footer-logo-img"/>
            </Container>
            <Container className="footer-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae elit scelerisque, viverra leo et, eleifend justo. Aliquam semper risus diam, a aliquam
            massa mollis at. Mauris in commodo orci. Nulla facilisis nisl blandit nulla viverra, sagittis porttitor lectus consectetur. Aliquam elementum nibh ut 
            lobortis sagittis. Nunc pharetra consectetur rhoncus. Nullam rhoncus luctus arcu commodo eleifend. Vestibulum nec sodales tellus. Vestibulum dignissim porta dolor.
            Phasellus quis pharetra elit. Nullam odio diam, vestibulum accumsan lacus vitae, fermentum dictum turpis.Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Quisque hendrerit consectetur dapibus. In a velit vitae ipsum eleifend rutrum in sed arcu. Cras vulputate, tellus nec dictum euismod, erat nisi tempus lacus, 
            ac posuere arcu felis vitae leo. Ut congue erat aliquet congue maximus. Vivamus venenatis justo justo, id malesuada diam euismod eget. Suspendisse sollicitudin 
            massa a nulla lobortis, non commodo ex feugiat. Suspendisse finibus felis nec magna efficitur, non vehicula lacus ultrices. Praesent hendrerit lacus et venenatis 
            faucibus. Suspendisse posuere mauris non dolor malesuada interdum. Fusce eget dui congue, fringilla odio a, sollicitudin turpis. Curabitur non consectetur odio.
            </Container>
        </footer>
    );
}

export default Footer;