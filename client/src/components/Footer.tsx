import "../styles/footer.css";
import diceLogo from "../assets/logo-450x300.webp";
import { Container } from "@chakra-ui/react";

function Footer() {
  return (
    <footer className="footer">
      <Container className="footer-logo">
        <img src={diceLogo} alt="No photo here" className="footer-logo-img" />
      </Container>
      <Container className="footer-description">
        Welcome to Dice, our global board game matchmaking platform, where
        players from around the world can connect and find like-minded
        individuals to enjoy their favorite board games together. Our website
        offers a comprehensive chat system and a sophisticated sorting feature,
        allowing you to discover people who share your enthusiasm for specific
        games. With our intuitive dashboard, you can effortlessly browse through
        profiles of other users and explore the games they love. Whether you're
        into strategy, card games, cooperative adventures, or classic board
        games, our sorting system ensures you'll find potential gaming partners
        with similar interests and preferences. Once you've found a fellow
        player you'd like to engage with, you can express your interest and
        await their response. When both users mutually agree to play, a
        dedicated chat room is created, allowing you to coordinate and discuss
        the details of your gaming session. Our website fosters a vibrant and
        diverse community of board game enthusiasts, breaking geographical
        boundaries and connecting players from different cultures and
        backgrounds. Whether you're seeking local opponents or craving
        international gaming experiences, our platform opens up a world of
        possibilities. Join us today and experience the joy of connecting with
        fellow board game aficionados, sharing memorable gaming moments, and
        forging friendships that transcend borders.
      </Container>
    </footer>
  );
}

export default Footer;
