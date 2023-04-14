import React from "react";
import '../styles/dashboard.css'
import NavbarMain from "../components/Navbar";
import { Container } from "reactstrap";
import Footer from "../components/Footer";

function Dashboard() {
    return(
        <div className="dashboard-body">
            <NavbarMain page="dashboard"/>
            <Footer/>
        </div>
    )
}

export default Dashboard