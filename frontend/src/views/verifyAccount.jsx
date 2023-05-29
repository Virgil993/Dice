import React from 'react'
import '../styles/verify_account.css'
import { Button, Container,Form,FormGroup,Label,Input,Alert, Card, CardHeader, CardTitle, CardBody, CardFooter } from 'reactstrap';
import diceLogo from '../assets/LOGO-3.webp'
import { User } from "../backend_sdk/user.sdk";
import { useNavigate, useParams } from "react-router-dom";
import {AiFillCheckCircle} from "react-icons/ai"

function VerifyAccount(){
    const navigate = useNavigate()
    const params = useParams()

    const [authorized,setAuthorized] = React.useState(false)

    React.useEffect(()=>{

        async function checkVerification(){
            const email = params.email
            const token = params.token
            const res = await User.checkVerification(email,token)
            if(!res || !res.success){
                console.log(res)
                localStorage.clear()
                navigate("/auth/home")
                return
            }
            else{
                const updateRes = await User.updateVerifed(email)
                if(!updateRes || !updateRes.success){
                    console.log(updateRes)
                    console.log("error at update verified user")
                    return;
                }
                setAuthorized(true)
            }
        }

        if(!authorized){
            checkVerification()
        }
    },[params])

    return(
        <div className='verify-account-body'>
            <header className='header-verify-account'>
                <Container className="header-logo">
                    <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
                </Container>
            </header>
            {
                authorized ? 
                <Container style={{display:"flex",justifyContent:"center",alignItems:"center",width:"100%",flexDirection:"column",gap:"15px"}}>
                <AiFillCheckCircle size={60} color='#198754'></AiFillCheckCircle>
                <div>Your account has been verified</div>
                <div>
                <a href="/auth/login" style={{fontWeight:"bold",color:"green"}}>sign in</a>
                </div>
                </Container>
                :
                <></>
            }
        </div>
    )
}

export default VerifyAccount