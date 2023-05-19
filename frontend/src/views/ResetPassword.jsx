import React from 'react'
import '../styles/reset_password.css'
import { Button, Container,Form,FormGroup,Label,Input,Alert, Card, CardHeader, CardTitle, CardBody, CardFooter } from 'reactstrap';
import diceLogo from '../assets/diceLogoTest.webp'
import { User } from "../backend_sdk/user.sdk";
import { useNavigate, useParams } from "react-router-dom";
import {AiFillCheckCircle} from "react-icons/ai"


function ResetPassword(){

    const navigate = useNavigate()

    const [password1,setPassword1] = React.useState("")
    const [password2,setPassword2] = React.useState("")
    const [error,setError] = React.useState(null)
    const [resetPasswordSent,setResetPasswordSent] = React.useState(false)
    const [authorized,setAuthorized] = React.useState(false)
 
    const params = useParams()

    React.useEffect(()=>{
      
        async function checkAuthUser(){
            const userId = params.id 
            const token = params.token
            const res = await User.userExist(userId,token)
            if(!res || !res.success){
                console.log(res)
                localStorage.clear()
                navigate("/auth/home")
                return
            }
            else{
                setAuthorized(true)
            }
        }

        if(!authorized){
            checkAuthUser()
        }
      
    },[params])


    async function handleSubmit(event){
        event.preventDefault();
        if(password1 !== password2){
            setError("Passwords do not match!")
            return
        }
        if(!password1 || !password2){
            setError("Both fields are mandatory!")
            return;
        }
        if(password1.length <=9 || password2.length <=9){
            setError("Password must have at least 10 caracters")
            return
        }
        setError(null)

        async function checkAuthUser(){
            const userId = params.id 
            const token = params.token
            const res = await User.userExist(userId,token)
            if(!res || !res.success){
                console.log(res)
                localStorage.clear()
                navigate("/auth/home")
                return
            }
            else{
                setAuthorized(true)
            }
        }

        await checkAuthUser()

        const resPass = await User.resetPassword(params.id,password1)
        if(!resPass || !resPass.success){
            console.log(resPass)
            console.log("error at reset password")
            setError("Unknown error please try again later")
            return
        }

        setResetPasswordSent(true)
    }

    return(
        <div className='reset-password-body'>
            <header className="header-reset-password">
                <Container className="header-logo">
                    <img src={diceLogo} alt="No photo here" className="header-logo-img"/>
                </Container>
            </header>
            {
                authorized ?
                <Container className='card-container'>
                <div style={{width:"100%"}}>
                <a href="/auth/login" style={{fontWeight:"bold",color:"green"}}>sign in</a>
                </div>
                {
                    resetPasswordSent ?
                    <Container style={{display:"flex",justifyContent:"center",alignItems:"center",width:"100%",flexDirection:"column",gap:"15px",margin:"30px"}}>
                        <AiFillCheckCircle size={60} color='#198754'></AiFillCheckCircle>
                        <div>Your password has been reset</div>
                    </Container>
                    :
                    <Card className='main-card'>
                        <CardHeader tag="h3">
                        Reset password
                        </CardHeader>
                        <CardBody style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:"10px"}}>
                        <div style={{textAlign:"center"}}>
                        Please enter your new password, note that it must be at least 10 characters long.
                        </div>
                        <div style={{width:"90%"}}>
                            <FormGroup>
                                <Label for='password'>New Password</Label>
                                <Input type='password' name='password' value={password1} placeholder='Write your password here' onChange={(e)=>{
                                    setPassword1(e.target.value)
                                }}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for='password'>Repeat Password</Label>
                                <Input type='password' name='password' value={password2} placeholder='Write your password again' onChange={(e)=>{
                                    setPassword2(e.target.value)
                                }}/>
                                <Alert isOpen={error != null} color='danger' style={{marginTop:"10px"}}>{error}</Alert>
                            </FormGroup>
                        </div>
                        </CardBody>
                        <CardFooter style={{display:"flex",justifyContent:'center',alignItems:"center"}}>
                                <Button color='success' style={{width:"50%",margin:"10px"}} onClick={handleSubmit}>Reset password</Button>
                        </CardFooter>   
                    </Card>
                }
            </Container>
            :
            <></>
            }
        </div>
    )
}

export default ResetPassword
