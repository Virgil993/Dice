import React from "react";
import '../styles/dashboard.css'
import NavbarMain from "../components/Navbar";
import { Container } from "reactstrap";
import Footer from "../components/Footer";
import { User } from "../backend_sdk/user.sdk";
import DashboardPerson from "../components/DashboardPerson";
import { dummyUser } from "../constants/utils";

function Dashboard() {

    const [user,setUser] = React.useState(null)
    const [allUsers,setAllUSers] = React.useState(undefined)
    const [usersLoaded,setUsersLoaded] = React.useState(false)
    const [indexInUsers,setIndexInUsers] = React.useState(0)

    React.useEffect(()=>{


        async function getUsers(){
            const res = await User.getUserByToken(localStorage.getItem("apiToken"))
            if(!res || !res.success){
                console.log("error at get user by token");
                navigate("/auth/home");
                return;
            }

            setUser(res.user)

            const resAllUsers = await User.getAllUsersSorted(res.user)
            if(!res || !res.success){
                console.log("error at get users sorted");
                return;
            }
            if(resAllUsers.users.length !=0){
                setAllUSers(resAllUsers.users)
                console.log(resAllUsers)
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

    React.useEffect(()=>{
        console.log(indexInUsers)
    },[indexInUsers])

    return(
        <div className="dashboard-body">
        {
            usersLoaded ?
            <div className="dashboard-body">
                <NavbarMain page="dashboard"/>
                <div className="dashboard-wrapper">
                    {
                        allUsers.length != 0 ?
                        <DashboardPerson 
                            user={allUsers[indexInUsers]} 
                            key={allUsers[indexInUsers]._id} 
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
                <Footer></Footer>
            </div>
            :
            <></>
        }  
        </div>
    )
}

export default Dashboard