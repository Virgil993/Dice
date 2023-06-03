import React from "react";
import '../styles/dashboard.css'
import { Navbar } from "../components/Navbar";
import { Container } from "reactstrap";
import { User } from "../backend_sdk/user.sdk";
import { useSelector } from "react-redux";
import {BsFillDice6Fill} from 'react-icons/bs'
import { DashboardPersonMain } from "../components/DashboardPerson";
import { FooterMain } from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Dashboard(props) {


    const navigate = useNavigate()

    const [user,setUser] = React.useState(null)
    const [allUsers,setAllUSers] = React.useState(undefined)
    const [usersLoaded,setUsersLoaded] = React.useState(false)
    const [indexInUsers,setIndexInUsers] = React.useState(0)
    const [navbarLoaded,setNavbarLoaded] = React.useState(false)

    function commonElements(array1,array2){
        const filterdArray = array1.filter(value => array2.includes(value))
        return filterdArray
    }

    React.useEffect(()=>{
        async function getUsers(){
            const res = await User.getUserByToken(localStorage.getItem("apiToken"))
            if(!res || !res.success){ 
                console.log("error at get user by token");
                navigate("/auth/home");
                return;
            }

            setUser(res.user)

            const resAllUsers = await User.getAllUsersSorted(localStorage.getItem("apiToken"),res.user)
            if(!res || !res.success){
                console.log("error at get users sorted");
                return;
            }
            // console.log(res.user.gamesSelected)
            if(resAllUsers.users.length !=0){
                setAllUSers(resAllUsers.users)
                // for(let i=0;i<resAllUsers.users.length;i++)
                // {
                //     console.log(resAllUsers.users[i].gamesSelected)
                //     console.log(commonElements(resAllUsers.users[i].gamesSelected,res.user.gamesSelected))
                //     console.log("\n")
                // }
            }
            else{
                setAllUSers([])
            }
        }
        if(!user){
            getUsers()
        }
    },[user])

    React.useEffect(()=>{
        if(allUsers && !usersLoaded){
            setUsersLoaded(true)
        }
    },[allUsers])


    return(
        <div className="dashboard-body">
        {
            usersLoaded ?
            <div className="dashboard-body">
                <Navbar page="dashboard" navbarLoaded={navbarLoaded} setNavbarLoaded={setNavbarLoaded}/>
                {
                    navbarLoaded ?
                    <div>
                    <div className="dashboard-wrapper">
                        {
                            allUsers.length != 0 ?
                            <DashboardPersonMain
                                connectedUser = {user}
                                user={allUsers[indexInUsers]} 
                                key={allUsers[indexInUsers]._id} 
                                userId = {allUsers[indexInUsers]._id}
                                indexInUsers={indexInUsers} 
                                maxLength={allUsers.length} 
                                setIndexInUsers={setIndexInUsers} 
                                gamesSelected={user.gamesSelected}/>
                            :
                            <Container style={{textAlign:"center",margin:"200px",marginBottom:"300px",fontSize:"30px"}}>
                                Oops, there are no more available users right now. Try again later to find new players to enjoy your games with!
                            </Container>
    
                        }
                        
                    </div>
                    <FooterMain></FooterMain>
                    </div>
                    :
                    <Container className="loading-dashboard">
                        <Container className="loading-icon"><BsFillDice6Fill size={70}/></Container>
                        <Container className="loading-text">Loading...</Container>
                    </Container>
                }
            </div>
            :
            <Container className="loading-dashboard">
                <Container className="loading-icon"><BsFillDice6Fill size={70}/></Container>
                <Container className="loading-text">Loading...</Container>
            </Container>
        }  
        </div>
    )
}

export const DashboardMain = Dashboard