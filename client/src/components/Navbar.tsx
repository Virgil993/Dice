import React, { useState } from "react";
import "../styles/navbar.css";
import { NavbarBrand } from "reactstrap";
import diceLogo from "../assets/LOGO-3.webp";
import { Link } from "react-router-dom";
import { BsPeopleFill } from "react-icons/bs";
import { RiMessage2Fill } from "react-icons/ri";
import { getUser } from "@/apiAxios";
import { ResponseStatus, type GetUserResponse } from "@/models/request";
import toast from "react-hot-toast";

export interface NavbarMainProps {
  page: string;
  setNavbarLoaded: (loaded: boolean) => void;
  navbarLoaded: boolean;
}

function NavbarMain(props: NavbarMainProps) {
  const [dashboardSelected, setDashboardSelected] = useState(false);
  const [mesagesSelected, setMesagesSelected] = useState(false);
  const [profileSelected, setProfileSelected] = useState(false);
  const [user, setUser] = useState<GetUserResponse | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [photoLoaded, setPhotoLoaded] = useState(false);

  React.useEffect(() => {
    async function getCurrentUser() {
      const userRes = await getUser();
      if (userRes.data.status === ResponseStatus.SUCCESS) {
        setUser(userRes.data);
        const image1 = userRes.data.photosUrls.find(
          (photo) => photo.position === 1
        )?.url;
        if (!image1) {
          toast.error("No profile photo found");
          console.error("No profile photo found");
        } else {
          setProfilePhoto(image1);
        }
      } else {
        toast.error(userRes.data.message || "Error fetching user data");
        console.error("Error fetching user data:", userRes.data.message);
      }
    }
    if (!user) {
      getCurrentUser();
    }
  }, [user, profilePhoto]);

  React.useEffect(() => {
    if (profilePhoto && !photoLoaded) {
      setPhotoLoaded(true);
      props.setNavbarLoaded(true);
    }
  }, [profilePhoto, photoLoaded, props]);

  React.useEffect(() => {
    if (props.page == "dashboard") {
      setDashboardSelected(true);
      setMesagesSelected(false);
      setProfileSelected(false);
    } else if (props.page == "messages") {
      setMesagesSelected(true);
      setDashboardSelected(false);
      setProfileSelected(false);
    } else {
      setProfileSelected(true);
      setMesagesSelected(false);
      setDashboardSelected(false);
    }
  }, [dashboardSelected, mesagesSelected, profileSelected, props.page]);

  return (
    <nav className="navbar-main">
      {photoLoaded && props.navbarLoaded ? (
        <div className="navbar-container">
          <span className="navbar-links">
            <NavbarBrand href="/admin/dashboard" className="navbar-logo">
              <img
                src={diceLogo}
                alt="No photo here"
                className="navbar-logo-img"
              />
            </NavbarBrand>
            <Link
              to="/dashboard"
              className="navlink"
              style={
                dashboardSelected
                  ? { borderBottom: "4px solid black" }
                  : { paddingBottom: "4px" }
              }
            >
              <div className="navlink-icon-container">
                <BsPeopleFill />
              </div>
              <h1 className="navlink-text">Discover</h1>
            </Link>
            <Link
              to="/messages"
              className="navlink"
              style={
                mesagesSelected
                  ? { borderBottom: "4px solid black" }
                  : { paddingBottom: "4px" }
              }
            >
              <div className="navlink-icon-container">
                <RiMessage2Fill />
              </div>

              <div className="messages-link-div">
                <h1 className="navlink-text">Messages</h1>
              </div>
            </Link>
          </span>
          <span className="navbar-links navbar-profile">
            <Link
              to="/profile"
              className="navlink"
              style={
                profileSelected
                  ? { borderBottom: "4px solid black" }
                  : { paddingBottom: "4px" }
              }
            >
              <div className="navlink-img-container">
                <img
                  className="navlink-icon-img"
                  src={profilePhoto}
                  alt="N/A"
                />
              </div>
              <h1 className="navlink-text">Profile</h1>
            </Link>
          </span>
        </div>
      ) : (
        <></>
      )}
    </nav>
  );
}

export default NavbarMain;
