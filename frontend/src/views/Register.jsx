import React from 'react';
import "../styles/register.css"
import Footer from '../components/Footer';
import { Button, Container,Form,FormGroup,Label,Input,FormText,Alert } from 'reactstrap';
import {availableGames} from '../constants/utils'
import GameRegister from '../components/GameRegister';
import { User } from "@genezio-sdk/DiceBackend_us-east-1";
import { useNavigate } from 'react-router-dom';


function Register() {

    const navigate = useNavigate();


    const [gamesSelected,setGamesSelected] = React.useState([])

    const [firstName,setFirstName] = React.useState("")
    const [email,setEmail] = React.useState("")
    const [password1,setPassword1] = React.useState("")
    const [password2,setPassword2] = React.useState("")
    const [birthday,setBirthday] = React.useState("")
    const [gender,setGender] = React.useState("")
    const [description,setDescription] = React.useState("")

    const [errorFirstName,setErrorFirstName] = React.useState(null)
    const [errorEmail,setErrorEmail] = React.useState(null)
    const [errorPassword1,setErrorPassword1] = React.useState(null)
    const [errorPassword2,setErrorPassword2] = React.useState(null)
    const [errorBirthday,setErrorBirthday] = React.useState(null)
    const [errorGender,setErrorGender] = React.useState(null)
    const [errorGeneral,setErrorGeneral] = React.useState(null)

    const [validContinue,setValidContinue]=React.useState(false)



    React.useEffect(()=>{
        if(gamesSelected.length>=5){
            setValidContinue(true)
        }
        else{
            setValidContinue(false)
        }
    },[gamesSelected,validContinue])


    function isValidEmail(email){
        return /\S+@\S+\.\S+/.test(email);
    }

    function calculateAge(date){
        var newDate = new Date(date);
        var nowDate = new Date();
        var ageDifMs = newDate - nowDate;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970)-1;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if(firstName==""){
            setErrorFirstName("First name is required!")
            var element = document.getElementById("first-name-register")
            element.scrollIntoView({behavior: 'smooth'})
            return;
        }
        if(email==""){
            setErrorEmail("Email is mandatory!")
            var element = document.getElementById("email-register")
            element.scrollIntoView({behavior: 'smooth'})
            return;
        }
        if(!isValidEmail(email)){
            setErrorEmail("Email is invalid!")
            var element = document.getElementById("email-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(password1==""){
            setErrorPassword1("Password is mandatory!")
            var element = document.getElementById("password1-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(password1.length<=9){
            setErrorPassword1("Password must have at least 10 characters!")
            var element = document.getElementById("password1-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(password2!==password1){
            setErrorPassword2("Passwords do not match!")
            var element = document.getElementById("password2-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(password2==""){
            setErrorPassword2("Password is mandatory!")
            var element = document.getElementById("password2-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(birthday==""){
            setErrorBirthday("Birthday is mandatory!")
            var element = document.getElementById("birthday-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(calculateAge(birthday)<18){
            setErrorBirthday("You need to be at least 18 years old to use this app!")
            var element = document.getElementById("birthday-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }
        if(gender==""){
            setErrorGender("Gender is mandatory!")
            var element = document.getElementById("gender-register")
            element.scrollIntoView({behavior: 'smooth'})
            return
        }


        const res = await User.create(
            firstName,
            email,
            password1,
            birthday,
            gender,
            description,
            gamesSelected
            ).catch((err) =>{
                setErrorGeneral(err.msg);
                console.log(err);
                return;
            })
            if(!res){
                setErrorGeneral("Unknown error, please try again later");
                console.log("Error at the Database");
                return;
            }
            if(!res.success){
                setErrorGeneral(res.msg);
                console.log(res.msg);
                return;
            }
            else{
                navigate("/auth/login");
            }
            

        // setIsSubmiting(true)

    }


    return(
        <div className='register-body'>
        <Form className='register-form'>
            <Container className='title-form'>
                <h1>Create an account</h1>
            </Container>
            <Container className='form-flexbox-1'>
                <Container>
                    <FormGroup>
                        <Label for="firstName">First Name</Label>
                        <Input type="text" name='name' id='first-name-register' value={firstName} className='input-register-text' placeholder='First Name' onChange={(e)=>{
                            if(e.target.value==""){
                                setFirstName(e.target.value)
                                setErrorFirstName("First name is required!")
                            }
                            else{
                                setErrorFirstName(null)
                                setFirstName(e.target.value)    
                            }
                        }} />
                        <Alert isOpen={errorFirstName != null} color="danger" style={{marginTop:"10px"}}>
                            {errorFirstName}
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email</Label>
                        <Input type="email" name='email' id='email-register' value={email} className='input-register-text' placeholder='Email' onChange={(e)=>{
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
                        <Input type="password" name='password1' value={password1} id='password1-register' className='input-register-text' placeholder='Password' onChange={(e)=>{
                            setPassword1(e.target.value)
                            if(e.target.value==""){
                                setErrorPassword1("Password is mandatory!")
                            }
                            else if(e.target.value.length<10){
                                setErrorPassword1("Password must have at least 10 characters!")
                            }
                            else{
                                setErrorPassword1(null)
                            }
                        }}/>
                        <Alert isOpen={errorPassword1 != null} color="danger" style={{marginTop:"10px"}}>
                            {errorPassword1}
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Confirm Password</Label>
                        <Input type="password" name='password2' value={password2} id='password2-register' className='input-register-text' 
                            placeholder='Write Your Password Again'
                            onChange={(e)=>{
                                setPassword2(e.target.value)
                                if(e.target.value!=password1){
                                    setErrorPassword2("Passwords do not match!")
                                }
                                else if(e.target.value==""){
                                    setErrorPassword2("Password is mandatory!")
                                }
                                else{
                                    setErrorPassword2(null)
                                }
                            }}
                        />
                        <Alert isOpen={errorPassword2 != null} color="danger" style={{marginTop:"10px"}}>
                            {errorPassword2}
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label for="birthday">Birthday</Label>
                        <Input type="date" name="date" id="birthday-register" value={birthday} className='input-register-text' placeholder="date placeholder"
                        onChange={(e)=>{
                            setBirthday(e.target.value)
                            if(e.target.value==""){
                                setErrorBirthday("Birthday is mandatory")
                            }
                            else if(calculateAge(e.target.value)<18){
                                setErrorBirthday("You need to be at least 18 years old to use this app!")
                            }
                            else {
                                setErrorBirthday(null)
                            }
                        }} 
                        />
                        <Alert isOpen={errorBirthday != null} color="danger" style={{marginTop:"10px"}}>
                            {errorBirthday}
                        </Alert>
                    </FormGroup>
                    <FormGroup id="gender-register"tag="fieldset" onChange={(e)=>{
                        setGender(e.target.value)
                        console.log(e.target.value)
                    }}>
                        <legend>Gender</legend>
                        <FormGroup check>
                            <Label check>
                            <Input type="radio" value={"Male"}  className='input-register-text' name="radio1" />{' '}
                                Male
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                            <Input type="radio" value={"Female"} className='input-register-text' name="radio1" />{' '}
                                Female
                            </Label>
                        </FormGroup>
                        <Alert isOpen={errorGender != null} color="danger" style={{marginTop:"10px"}}>
                            {errorGender}
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label for="description">Description</Label>
                        <Input type="textarea" name="description" id="description-register" value={description} className='input-register-text' 
                            placeholder='Describe yourself in a few words'
                            onChange={(e)=>{
                                setDescription(e.target.value)
                            }} 
                        />
                        <FormText color="muted">
                            Adding a description significantly improves your chances of being picked by other players to join their games
                        </FormText>
                    </FormGroup>
                </Container>
            </Container>
            <Container style={{textAlign:"center",fontSize:"30px",marginBottom:"30px"}}>What games do you play?</Container>
            <Container className='games-container-register'>
            {
                availableGames.map((element,index) =>(
                    <GameRegister key={element} name={element} isSelected={gamesSelected.includes(index)} onClick={()=>{
                        if(gamesSelected.includes(index)){
                            let newlist = [...gamesSelected];
                            const result = newlist.filter(game => game!=index)
                            setGamesSelected(result);
                        }
                        else{
                            let newlist = [...gamesSelected];
                            newlist.push(index);
                            setGamesSelected(newlist);
                        }
                    }}></GameRegister>
                ))
            }
            <Container style={{textAlign:"center",marginTop:"20px",fontSize:"20px"}}>Choose at least 5 games to continue</Container>
            </Container>
            <Alert isOpen={errorGeneral != null} color="danger" style={{marginTop:"10px"}}>
                {errorGeneral}
            </Alert>
            <Container className='continue-button-container'>
                {
                    validContinue ?
                    <Button className='continue-button' color="success"size='lg' onClick={(e)=>{handleSubmit(e)}}>Continue</Button>
                    :
                    <Button className='continue-button' size='lg' style={{cursor:"auto"}} onClick={(e)=>{e.preventDefault()}}>Continue</Button>
                }
            </Container>
            <Container className='login-link'>
                Already have an account?
                <a href="/auth/login">Log in here</a>
            </Container>

        </Form>
        <Footer/>
        </div>
        
    )
}

export default Register

