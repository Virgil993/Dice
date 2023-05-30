import React  from 'react'
import './styles/App.css';
import HomePage from './views/home.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import {} from "reactstrap"
import Register from './views/Register';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AdminLayout from './layouts/Admin';
import AuthLayout from './layouts/Auth';
import Messages from './views/Messages';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import { socket } from './socket';
import VerifyAccount from './views/verifyAccount';

function App() {

    const [isConnected,setIsConnected] = React.useState(socket.connected)


    React.useEffect(()=>{
      const handleTabClose = event =>{
        event.preventDefault();
        console.log("before unload evenet triggered");
        localStorage.setItem("retrievedNotifications",JSON.stringify(false))
      }
      window.addEventListener("beforeunload",handleTabClose);

      return () =>{
        window.removeEventListener("beforeunload",handleTabClose);
      }
    },[])

    React.useEffect(()=>{
      function onConnect(){
          setIsConnected(true)
      }
      function onDisconnect(){
          setIsConnected(false)
      }

      socket.on('connect',onConnect);
      socket.on('disconnect',onDisconnect)

      return () =>{
          socket.off('connect',onConnect)
          socket.off('disconnect',onDisconnect)
      };
  },[])

  return (
      <div className='app'>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/dashboard" element={<AdminLayout element={<Dashboard/>}/>}/>
            <Route path="/admin/profile" element={<AdminLayout element={<Profile  />}  />} />
            <Route path="/admin/messages" element={<AdminLayout element={<Messages />}/>} />
            <Route path="/auth/login" element={<AuthLayout element={<Login />} />} />
            <Route path="/auth/register" element={<AuthLayout element={<Register />} />}/>
            <Route path='/auth/verifyEmail/:email/:token' element={<AuthLayout element={<VerifyAccount/>}/>} />
            <Route path='/auth/forgotPassword' element={<AuthLayout element={<ForgotPassword/>}/>} />
            <Route path='/auth/resetPassword/:id/:token' element={<AuthLayout element={<ResetPassword/>}/>} />
            <Route path="/auth/home" element={<AuthLayout element={<HomePage />} />} />
            <Route path="*" element={<Navigate to="/auth/home" />} />
          </Routes>
        </BrowserRouter>
      </div>
  )
}

export default App
