import React from "react";
import '../styles/profile.css'
import NavbarMain from "../components/Navbar";
import { Button, Container } from "reactstrap";
import Footer from "../components/Footer";
import { User } from "../backend_sdk/user.sdk";

function Profile() {

    const [errro, setError] = React.useState(null)

    async function handleLogout(event) {
        event.preventDefault();
        const res = await User.logout(localStorage.getItem("apiToken")).catch(
          (err) => {
            setError(err.msg);
            console.log(JSON.stringify(err));
    
            return;
          }
        );
    
        if (!res) {
          setError("Unknown error, please try again later");
          console.log("Error at the Database");
          return;
        }
        if (!res.success) {
          setError(res.msg);
          console.log(res.error);
          return;
        }
        localStorage.clear();
        navigate("/auth/home");
    }

    return(
        <div className="profile-body">
            <NavbarMain page="profile"/>
            <Button onClick={handleLogout}>Log out</Button>
        </div>
    )
}

export default Profile