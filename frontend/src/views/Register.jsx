import React from 'react';
import "../styles/register.css"
import Footer from '../components/Footer';
import { Button, Container,Form,FormGroup,Label,Input,FormText,Alert } from 'reactstrap';
import {acceptedFileTypesPhotos,availableGames} from '../constants/utils'
import closeIconLogo from '../assets/closePhotoIcon.svg'
import addIconLogo from '../assets/addPhotoIcon.svg'
import GameRegister from '../components/GameRegister';
import { User } from '../backend_sdk/user.sdk';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression'


function Register() {

    const navigate = useNavigate();

    const [image1,setImage1] = React.useState(null)
    const [photo1Border,setPhoto1Border] = React.useState("2px dashed rgb(58, 58, 66)")

    const [image2,setImage2] = React.useState(null)
    const [photo2Border,setPhoto2Border] = React.useState("2px dashed rgb(58, 58, 66)")

    const [image3,setImage3] = React.useState(null)
    const [photo3Border,setPhoto3Border] = React.useState("2px dashed rgb(58, 58, 66)")
    
    const [image4,setImage4] = React.useState(null)
    const [photo4Border,setPhoto4Border] = React.useState("2px dashed rgb(58, 58, 66)")

    const [image1File,setImage1File] = React.useState(null)
    const [image2File,setImage2File] = React.useState(null)
    const [image3File,setImage3File] = React.useState(null)
    const [image4File,setImage4File] = React.useState(null)


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

    const [isSubmiting,setIsSubmiting] = React.useState(false)

    const [validContinue,setValidContinue]=React.useState(false)



    React.useEffect(()=>{
        var numberOfImages=0
        if(image1){
            numberOfImages=numberOfImages+1
        }
        if(image2){
            numberOfImages=numberOfImages+1
        }
        if(image3){
            numberOfImages=numberOfImages+1
        }
        if(image4){
            numberOfImages=numberOfImages+1
        }
        if(gamesSelected.length>=5 && numberOfImages>=2){
            setValidContinue(true)
        }
        else{
            setValidContinue(false)
        }
    },[image1,image2,image3,image4,gamesSelected,validContinue])


    function isValidEmail(email){
        return /\S+@\S+\.\S+/.test(email);
    }

    function calculateAge(date){
        var newDate = new Date(date);
        var nowDate = new Date();
        var ageDifMs = newDate - nowDate;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    function convertBase64(blob){
        return new Promise((resolve,reject) => {
            const file = new File([blob],"Image",{
                type: blob.type
            })
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (err)=>{
                reject(err);
            }
        })
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
        if(password1.length<9){
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
        if(calculateAge(birthday)-1<18){
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

        var image1DB
        var image2DB
        var image3DB = null
        var image4DB = null

        if(image1 == null){
            if(image2 == null){
                image1DB = await convertBase64(image3File)
                image2DB = await convertBase64(image4File)
            }
            else{
                image1DB = await convertBase64(image2File)
                if(image3 == null){
                    image2DB = await convertBase64(image4File)
                }
                else{
                    image2DB = await convertBase64(image3File)
                    if(image4 != null){
                        image3DB = await convertBase64(image4File)
                    }
                }
            }
        }
        else{
            image1DB = await convertBase64(image1File)
            if(image2 == null){
                if(image3 == null){
                    image2DB = await convertBase64(image4File)
                }
                else{
                    image2DB=await convertBase64(image3File)
                    if(image4 != null){
                        image3DB = await convertBase64(image4File)
                    }
                }
            }
            else{
                image2DB = await convertBase64(image2File)
                if(image3 == null){
                    if(image4 != null){
                        image3DB = await convertBase64(image4File)
                    }
                }
                else{
                    image3DB = await convertBase64(image3File)
                    if(image4 != null){
                        image4DB = await convertBase64(image4File)
                    }
                }
            }
        }

        
        
        

        const res = await User.create(
            firstName,
            email,
            password1,
            birthday,
            gender,
            description,
            image1DB,
            image2DB,
            image3DB,
            image4DB,
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
                            else if(calculateAge(e.target.value)-1<18){
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
                <Container className='right-side-container'>
                    <Label>Photos</Label>
                    <Container className='photo-upload-container'>
                    <FormGroup className='file-upload-form-group' style={{border:photo1Border}} onClick={()=>{
                        if(!image1){
                            document.querySelector(".photo1-upload-register").click()
                        }
                    }}>
                        <Input 
                            type="file" 
                            accept='image/*' 
                            className='photo1-upload-register' 
                            hidden 
                            onChange={async (event)=>{
                                event.preventDefault()
                                if(event.target.files &&  acceptedFileTypesPhotos.includes(event.target.files[0].type)){
                                    setImage1(URL.createObjectURL(event.target.files[0]))
                                    setPhoto1Border("hidden")
                                    const options = {
                                        maxSizeMB: 0.5,
                                        maxWidthOrHeight: 1024
                                    }
                                    try{
                                        const compressedFile = await imageCompression(event.target.files[0],options)
                                        setImage1File(compressedFile)
                                    }
                                    catch (error) {
                                        console.log(error)
                                    }
                                }
                                event.target.value=null
                                
                            }}
                        />
                        {
                            image1 ?
                            <img src={image1} width={'100%'} height={'100%'} className="photo-register"/> : 
                            <img
                            src={addIconLogo}
                            className= "add-photo-icon"
                            curosor="pointer" 
                            />
                            
                        }
                        {
                            image1 ?
                            <img
                            src={closeIconLogo}
                            className='remove-photo-icon'  
                            cursor='pointer' 
                            onClick={()=>{
                                setImage1File(null)
                                setImage1(null)
                                setPhoto1Border("2px dashed rgb(58, 58, 66)")
                            }}
                            /> : <></>
                        }
                    </FormGroup>

                    <FormGroup className='file-upload-form-group' style={{border:photo2Border}} onClick={()=>{
                        if(!image2){
                            document.querySelector(".photo2-upload-register").click()
                        }
                    }}>
                        <Input 
                            type="file" 
                            accept='image/*' 
                            className='photo2-upload-register' 
                            hidden 
                            onChange={async (event)=>{
                                event.preventDefault()
                                if(event.target.files &&  acceptedFileTypesPhotos.includes(event.target.files[0].type)){
                                    setImage2(URL.createObjectURL(event.target.files[0]))
                                    setPhoto2Border("hidden")
                                    const options = {
                                        maxSizeMB: 0.5,
                                        maxWidthOrHeight: 1024
                                    }
                                    try{
                                        const compressedFile = await imageCompression(event.target.files[0],options)
                                        setImage2File(compressedFile)
                                    }
                                    catch (error) {
                                        console.log(error)
                                    }
                                }
                                event.target.value=null
                                
                            }}
                        />
                        {
                            image2 ?
                            <img src={image2} width={'100%'} height={'100%'} className="photo-register"/> : 
                            <img
                            src={addIconLogo}
                            className= "add-photo-icon"
                            curosor="pointer" 
                            />
                            
                        }
                        {
                            image2 ?
                            <img
                            src={closeIconLogo}
                            className='remove-photo-icon'  
                            cursor='pointer' 
                            onClick={()=>{
                                setImage2File(null)
                                console.log(image2File)
                                setImage2(null)
                                setPhoto2Border("2px dashed rgb(58, 58, 66)")
                            }}
                            /> : <></>
                        }
                    </FormGroup>

                    <FormGroup className='file-upload-form-group' style={{border:photo3Border}} onClick={()=>{
                        if(!image3){
                            document.querySelector(".photo3-upload-register").click()
                        }
                    }}>
                        <Input 
                            type="file" 
                            accept='image/*' 
                            className='photo3-upload-register' 
                            hidden 
                            onChange={async (event)=>{
                                event.preventDefault()
                                if(event.target.files &&  acceptedFileTypesPhotos.includes(event.target.files[0].type)){
                                    setImage3(URL.createObjectURL(event.target.files[0]))
                                    setPhoto3Border("hidden")
                                    const options = {
                                        maxSizeMB: 0.5,
                                        maxWidthOrHeight: 1024
                                    }
                                    try{
                                        const compressedFile = await imageCompression(event.target.files[0],options)
                                        setImage3File(compressedFile)
                                    }
                                    catch (error) {
                                        console.log(error)
                                    }
                                }
                                event.target.value=null
                                
                            }}
                        />
                        {
                            image3 ?
                            <img src={image3} width={'100%'} height={'100%'} className="photo-register"/> : 
                            <img
                            src={addIconLogo}
                            className= "add-photo-icon"
                            curosor="pointer" 
                            />
                            
                        }
                        {
                            image3 ?
                            <img
                            src={closeIconLogo}
                            className='remove-photo-icon'  
                            cursor='pointer' 
                            onClick={()=>{
                                setImage3File(null)
                                setImage3(null)
                                setPhoto3Border("2px dashed rgb(58, 58, 66)")
                            }}
                            /> : <></>
                        }
                    </FormGroup>

                    <FormGroup className='file-upload-form-group' style={{border:photo4Border}} onClick={()=>{
                        if(!image4){
                            document.querySelector(".photo4-upload-register").click()
                        }
                    }}>
                        <Input 
                            type="file" 
                            accept='image/*' 
                            className='photo4-upload-register' 
                            hidden 
                            onChange={async (event)=>{
                                event.preventDefault()
                                if(event.target.files &&  acceptedFileTypesPhotos.includes(event.target.files[0].type)){
                                    setImage4(URL.createObjectURL(event.target.files[0]))
                                    setPhoto4Border("hidden")
                                    const options = {
                                        maxSizeMB: 0.5,
                                        maxWidthOrHeight: 1024
                                    }
                                    try{
                                        const compressedFile = await imageCompression(event.target.files[0],options)
                                        setImage4File(compressedFile)
                                    }
                                    catch (error) {
                                        console.log(error)
                                    }
                                }
                                event.target.value=null
                                
                            }}
                        />
                        {
                            image4 ?
                            <img src={image4} width={'100%'} height={'100%'} className="photo-register"/> : 
                            <img
                            src={addIconLogo}
                            className= "add-photo-icon"
                            curosor="pointer" 
                            />
                            
                        }
                        {
                            image4 ?
                            <img
                            src={closeIconLogo}
                            className='remove-photo-icon'  
                            cursor='pointer' 
                            onClick={()=>{
                                setImage4File(null)
                                setImage4(null)
                                setPhoto4Border("2px dashed rgb(58, 58, 66)")
                            }}
                            /> : <></>
                        }
                    </FormGroup>
                    </Container>
                    <Container style={{textAlign:"center"}}>
                        Add at least 2 photos to continue
                    </Container>
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

