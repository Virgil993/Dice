import React from "react";
import '../styles/login.css'
import { Button, Container,Form,FormGroup,Label,Input,Alert, Card, CardHeader, CardTitle, CardBody, CardFooter } from 'reactstrap';
// import diceLogo from '../assets/diceLogoTest.webp'
// import diceLogo from '../assets/logo-450x300.webp'
import diceLogo from '../assets/LOGO-3.webp'
import { User } from "../backend_sdk/user.sdk";
import { useNavigate } from "react-router-dom";

function Login(){

    const navigate = useNavigate()

    const [email,setEmail] = React.useState("")
    const [password,setPassword] = React.useState("")
    
    const [errorEmail,setErrorEmail] = React.useState(null)
    const [errorPassword,setErrorPassword] = React.useState(null)
    const [errorGeneral, setErrorGeneral] = React.useState(null)

    function isValidEmail(email){
        return /\S+@\S+\.\S+/.test(email);
    }


    async function handleSubmit(event) {
        event.preventDefault();
        if(email==""){
            setErrorEmail("Email is mandatory!")
            var element = document.getElementById("email-login")
            element.scrollIntoView({behavior: 'smooth'})
            return;
        }
        if(!isValidEmail(email)){
            setErrorEmail("Email is invalid!")
            var element = document.getElementById("email-login")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(password==""){
            setErrorPassword("Password is mandatory!")
            var element = document.getElementById("password-login")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }

        const res = await User.login(email,password).catch((err)=>{
            setErrorGeneral(err.msg);
            console.log(err.error);
            return;
        });
        if (!res){
            setErrorGeneral("Unknown error, please try again later");
            console.log("Error at the Database");
            return;
        }
        if (!res.success) {
            setErrorGeneral(res.msg);
            console.log(res.msg);
            return;
        } else {
            localStorage.setItem("apiToken", res.token);
            localStorage.setItem("conversations",JSON.stringify([]))
            localStorage.setItem("messages",JSON.stringify([]))
            localStorage.setItem("retrievedNotifications",JSON.stringify(false))
            navigate("/admin/dashboard");
        }


    }

    return (
        <div className="login-body">
            <header className="header-login">
                <Container className="header-logo">
                    <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
                </Container>
            </header>
            <Container className="card-container">
                <Card className="card-form">
                    <Form>
                        <CardHeader>
                            <CardTitle tag="h3">Sign in</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input type="email" name='email' id='email-login' value={email} className='input-login-text' placeholder='Email' onChange={(e)=>{
                                    setEmail(e.target.value)
                                    if(e.target.value==""){
                                        setErrorEmail("Email is mandatory!")
                                    }
                                    else if(!isValidEmail(e.target.value)){
                                        setErrorEmail("Email is invalid!")
                                    }
                                    else{
                                        setErrorEmail(null)
                                    }
                                }}/>
                                <Alert isOpen={errorEmail != null} color="danger" style={{marginTop:"10px"}}>
                                    {errorEmail}
                                </Alert>
                            </FormGroup>
                            <FormGroup>
                                <Label for="password">Password</Label>
                                <Input type="password" name='password' id='password-login' value={password} className='input-login-text' placeholder='Password' onChange={(e)=>{
                                    setPassword(e.target.value)
                                    if(e.target.value==""){
                                        setErrorPassword("Password is mandatory!")
                                    }
                                    else{
                                        setErrorPassword(null)
                                    }
                                }}/>
                                <Alert isOpen={errorPassword != null} color="danger" style={{marginTop:"10px"}}>
                                    {errorPassword}
                                </Alert>
                            </FormGroup>
                            <Container style={{marginTop:"20px",paddingLeft:"0px"}}>
                                <a href="/auth/forgotPassword" style={{fontWeight:"bold",color:"green"}}>Forgot password?</a>
                            </Container>
                        </CardBody>
                        <CardFooter style={{display:"flex",flexDirection:"column"}}>
                            <Button className='continue-button' color="success"size='lg' style={{marginTop:"10px",marginBottom:"20px"}} onClick={(e)=>{handleSubmit(e)}}>Continue</Button>
                            <Alert isOpen={errorGeneral != null} color="danger" style={{marginTop:"10px"}}>
                                {errorGeneral}
                            </Alert>
                            <span>
                                Don't have an account? <a href="/auth/register" style={{fontWeight:"bold",color:"green"}}>Register</a>
                            </span>
                        </CardFooter>
                    </Form>
                </Card>
            </Container>
        </div>
    )

}

export const LoginMain = Login;