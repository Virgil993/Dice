import React from "react";
import "../styles/navbar.css"
import { NavbarBrand } from "reactstrap";
import diceLogo from '../assets/LOGO-3.webp'
import { Link, useNavigate } from "react-router-dom";
import {BsPeopleFill }from "react-icons/bs"
import {RiMessage2Fill} from "react-icons/ri"
import { User } from "@genezio-sdk/DiceBackend_us-east-1";
import { useSelector } from "react-redux";
import profileSVG from "../assets/addPhotoIcon"

function NavbarMain(props) {

    const navigate = useNavigate();

    const {conversations,messages} = useSelector((state) => state.notifications)

    const [dashboardSelected,setDashboardSelected] = React.useState(false)
    const [mesagesSelected,setMesagesSelected] = React.useState(false)
    const [profileSelected,setProfileSelected] = React.useState(false)
    const [user,setUser] = React.useState(null)
    const [notificationActive,setNotificationActive] = React.useState(false)

    

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
        if(!user){
            getUser()
            
        }
    },[user,conversations,messages])

    React.useEffect(()=>{
        if(conversations && conversations.length !=0){
            setNotificationActive(true)
        }
        if(conversations && conversations.length == 0){
            setNotificationActive(false)
        }
    },[conversations,messages])



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
        {
            props.navbarLoaded?
            <div className="navbar-container">
            <span className="navbar-links">
                <NavbarBrand href="/admin/dashboard" className="navbar-logo">
                <img src={diceLogo} alt="No photo here" className="navbar-logo-img"/>
                </NavbarBrand>
                <Link to="/admin/dashboard" className="navlink" style={
                    dashboardSelected ?
                    {borderBottom:"4px solid black"}
                    :
                    {paddingBottom: "4px"}
                    }>
                    <div className="navlink-icon-container">
                    <BsPeopleFill/>
                    </div>
                    <h1 className="navlink-text">Discover</h1>
                </Link>
                <Link to="/admin/messages" className="navlink" style={
                    mesagesSelected ?
                    {borderBottom:"4px solid black"}
                    :
                    {paddingBottom:"4px"}
                }>
                    <div className="navlink-icon-container">
                    <RiMessage2Fill/>
                    </div>
                    {
                        notificationActive ?
                        <div className="messages-link-div">
                        <div>
                        <h1 className="navlink-text">
                            Messages
                        </h1>
                        </div>
                        <div className="notification-div">
                            <div className="notification-point">
                                <div>
                                    {conversations.length}
                                </div>
                            </div>
                        </div>
                        </div>
                        :
                        <div className="messages-link-div">
                        <h1 className="navlink-text">
                            Messages
                        </h1>
                        </div>
                    }
                </Link>  
            </span>
            <span className="navbar-links navbar-profile">
                <Link to="/admin/profile" className="navlink" style={
                    profileSelected ?
                    {borderBottom:"4px solid black"}
                    : 
                    {paddingBottom:"4px"}
                    }>
                    <div className="navlink-img-container">
                    <img className="navlink-icon-img" src={profileSVG} alt="N/A" />
                    </div>
                    <h1 className="navlink-text">Profile</h1>
                </Link>
            </span>
            </div>
            :
            <></>
        }
        </nav>
    )
}

export default NavbarMain