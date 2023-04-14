import React from "react";
import "../styles/navbar.css"
import { Container,Button,Navbar,NavbarBrand, NavbarToggler,Nav,NavItem,NavLink } from "reactstrap";
import diceLogo from "../assets/diceLogoTest.webp"
import { useNavigate } from "react-router-dom";
import {BsPeopleFill }from "react-icons/bs"
import {RiMessage2Fill} from "react-icons/ri"
import { User } from "../backend_sdk/user.sdk";

function NavbarMain(props) {

    const navigate = useNavigate();

    const [dashboardSelected,setDashboardSelected] = React.useState(false)
    const [mesagesSelected,setMesagesSelected] = React.useState(false)
    const [profileSelected,setProfileSelected] = React.useState(false)
    const [user,setUser] = React.useState(null)

    React.useEffect(()=>{

        async function getUser(){
            const res = await User.getUserByToken(localStorage.getItem("apiToken"))
            if(!res || !res.success){
                console.log("error at get user by token");
                navigate("/auth/home");
                return;
            }
            setUser(res.user)
        }

        getUser()
    })


    React.useEffect(()=>{
        if(props.page=="dashboard"){
            setDashboardSelected(true)
            setMesagesSelected(false)
            setProfileSelected(false)
        }        
        else if(props.page == "messages"){
            setMesagesSelected(true)
            setDashboardSelected(false)
            setProfileSelected(false)
        }
        else{
            setProfileSelected(true)
            setMesagesSelected(false)
            setDashboardSelected(false)
        }
    },[dashboardSelected,mesagesSelected,profileSelected])


    return (
        <nav className="navbar-main">
            <div className="navbar-container">
                <span className="navbar-links">
                    <NavbarBrand href="/admin/dashboard" className="navbar-logo">
                    <img src={diceLogo} alt="No photo here" className="navbar-logo-img"/>
                    </NavbarBrand>

                    {
                        dashboardSelected ?
                        <NavLink href="/admin/dashboard" className="navlink" style={{borderBottom:"4px solid black"}}>
                            <div className="navlink-icon-container">
                            <BsPeopleFill/>
                            </div>
                            <h1 className="navlink-text">Discover</h1>
                        </NavLink>
                        :
                        <NavLink href="/admin/dashboard" className="navlink" style={{paddingBottom:"4px"}}>
                            <div className="navlink-icon-container">
                            <BsPeopleFill/>
                            </div>
                            <h1 className="navlink-text">Discover</h1>
                        </NavLink>

                    }

                    {   
                        mesagesSelected ?
                        <NavLink href="/admin/dashboard" className="navlink" style={{borderBottom:"4px solid black"}}>
                            <div className="navlink-icon-container">
                            <RiMessage2Fill/>
                            </div>
                            <h1 className="navlink-text">Messages</h1>
                        </NavLink>
                        :
                        <NavLink href="/admin/dashboard" className="navlink" style={{paddingBottom:"4px"}}>
                            <div className="navlink-icon-container">
                            <RiMessage2Fill/>
                            </div>
                            <h1 className="navlink-text">Messages</h1>
                        </NavLink>

                    }
                </span>
                <span className="navbar-links navbar-profile">
                    {   
                        profileSelected ?
                        <NavLink href="/admin/dashboard" className="navlink" style={{borderBottom:"4px solid black"}}>
                            <div className="navlink-icon-container">
                            <img src={"sads"} alt="N/A" />
                            </div>
                            <h1 className="navlink-text">Profile</h1>
                        </NavLink>
                        :
                        <NavLink href="/admin/dashboard" className="navlink" style={{paddingBottom:"4px"}}>
                            <div className="navlink-icon-container">
                            <img src={"sad."} alt="N/A" />
                            </div>
                            <h1 className="navlink-text">Profile</h1>
                        </NavLink>

                    }
                </span>
            </div>
        </nav>
    )
}

export default NavbarMain