import React from 'react'
import '../styles/forgot_password.css'
import { Button, Container,Form,FormGroup,Label,Input,Alert, Card, CardHeader, CardTitle, CardBody, CardFooter } from 'reactstrap';
import diceLogo from '../assets/diceLogoTest.webp'
import { User } from "../backend_sdk/user.sdk";
import { useNavigate } from "react-router-dom";
import {AiFillCheckCircle} from "react-icons/ai"


function ForgotPassword(){

    const navigate = useNavigate()

    const [email,setEmail] = React.useState("")
    const [error,setError] = React.useState(null)
    const [emailSent,setEmailSent] = React.useState(false)


    function isValidEmail(email){
        return /\S+@\S+\.\S+/.test(email);
    }

    async function handleSubmit(event){
        event.preventDefault();
        if(!email){
            setError("Email is mandatory to continue!")
            var element = document.getElementById("email-forgot-password")
            element.scrollIntoView({behavior: 'smooth'})
            return;
        }
        if(!isValidEmail(email)){
            setError("Email is invalid!")
            var element = document.getElementById("email-forgot-password")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        const res = await User.forgotPassword(email)
        if(!res || !res.success){
            console.log(res)
            console.log("error at send email")
            setError("Unknown error, please try again later")
            return
        }
        setEmailSent(true)
    }

    return(
        <div className='forgot-password-body'>
            <header className="header-forgot-password">
                <Container className="header-logo">
                    <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
                </Container>
            </header>
            <Container className='card-container'>
                <div style={{width:"100%"}}>
                <a href="/auth/login" style={{fontWeight:"bold",color:"green"}}>Back to sign in</a>
                </div>
                {
                    emailSent ?
                    <Container style={{display:"flex",justifyContent:"center",alignItems:"center",width:"100%",flexDirection:"column",gap:"15px",margin:"30px"}}>
                        <AiFillCheckCircle size={60} color='#198754'></AiFillCheckCircle>
                        <div>Email sent successfully</div>
                        <div>Be sure to also check your spam folder</div>
                    </Container>
                    :
                    <Card className='main-card'>
                        <CardHeader tag="h3">
                        Forgot password?
                        </CardHeader>
                        <CardBody style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
                        <div style={{textAlign:"center"}}>
                        Enter the email address associated with your Dice account.
                        </div>
                        <div>
                            <FormGroup>
                                <Label for='email'>Email</Label>
                                <Input type='email' name='email' id='email-forgot-password' value={email} className='input-forgot-password' placeholder='Email' onChange={(e)=>{
                                    setEmail(e.target.value)
                                    if(e.target.value == ""){
                                        setError("Email is mandatory to continue!")
                                    }
                                    else if(!isValidEmail(e.target.value)){
                                        setError("Email is invalid!")
                                    }
                                    else{
                                        setError(null)
                                    }
                                }}/>
                                <Alert isOpen={error != null} color='danger' style={{marginTop:"10px"}}>{error}</Alert>
                            </FormGroup>
                        </div>
                        </CardBody>
                        <CardFooter style={{display:"flex",justifyContent:'center',alignItems:"center"}}>
                                <Button color='success' style={{width:"50%",margin:"10px"}} onClick={handleSubmit}>Continue</Button>
                        </CardFooter>   
                    </Card>
                }
            </Container>
        </div>
    )
}

export default ForgotPassword


