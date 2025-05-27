import React from "react";
import "../styles/dashboard.css";
import NavbarMain from "../components/Navbar";
import { Container } from "reactstrap";
import Footer from "../components/Footer";
import DashboardPerson from "../components/DashboardPerson";
import { BsFillDice6Fill } from "react-icons/bs";
import { ResponseStatus, type GetUserResponse } from "@/models/request";
import type { FullExternalUser } from "@/models/user";
import { getUser, getUsersSorted } from "@/apiAxios";
import toast from "react-hot-toast";

function Dashboard() {
  const [user, setUser] = React.useState<GetUserResponse>();
  const [allUsers, setAllUSers] = React.useState<FullExternalUser[]>([]);
  const [usersLoaded, setUsersLoaded] = React.useState<boolean>(false);
  const [indexInUsers, setIndexInUsers] = React.useState<number>(0);
  const [navbarLoaded, setNavbarLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function getUsers() {
      const res = await getUser();
      if (res.data.status === ResponseStatus.ERROR) {
        console.error("Error fetching user data:", res.data.message);
        toast.error("Error fetching user data: " + res.data.message);
        return;
      }

      setUser(res.data);

      const resAllUsers = await getUsersSorted();
      if (resAllUsers.data.status === ResponseStatus.ERROR) {
        console.error("Error fetching all users:", resAllUsers.data.message);
        toast.error("Error fetching all users: " + resAllUsers.data.message);
        return;
      }
      setAllUSers(resAllUsers.data.users);
    }
    if (!user) {
      getUsers();
    }
  }, [user]);

  React.useEffect(() => {
    if (user && !usersLoaded) {
      setUsersLoaded(true);
    }
  }, [user, usersLoaded]);

  return (
    <div className="dashboard-body">
      {usersLoaded ? (
        <div className="dashboard-body">
          <NavbarMain
            page="dashboard"
            navbarLoaded={navbarLoaded}
            setNavbarLoaded={setNavbarLoaded}
          />
          {navbarLoaded ? (
            <div>
              <div className="dashboard-wrapper">
                {allUsers.length != 0 && user ? (
                  <DashboardPerson
                    user={allUsers[indexInUsers]}
                    indexInUsers={indexInUsers}
                    maxLength={allUsers.length}
                    setIndexInUsers={setIndexInUsers}
                    gamesSelected={user.games}
                  />
                ) : (
                  <Container
                    style={{
                      textAlign: "center",
                      margin: "200px",
                      marginBottom: "300px",
                      fontSize: "30px",
                    }}
                  >
                    Oops, there are no more available users right now. Try again
                    later to find new players to enjoy your games with!
                  </Container>
                )}
              </div>
              <Footer></Footer>
            </div>
          ) : (
            <Container className="loading-dashboard">
              <Container className="loading-icon">
                <BsFillDice6Fill size={70} />
              </Container>
              <Container className="loading-text">Loading...</Container>
            </Container>
          )}
        </div>
      ) : (
        <Container className="loading-dashboard">
          <Container className="loading-icon">
            <BsFillDice6Fill size={70} />
          </Container>
          <Container className="loading-text">Loading...</Container>
        </Container>
      )}
    </div>
  );
}

export default Dashboard;
