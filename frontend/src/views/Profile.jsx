import React from "react";
import '../styles/profile.css'
import NavbarMain from "../components/Navbar";
import { Alert, Button, Card, CardBody, CardTitle, Container, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import Footer from "../components/Footer";
import { User } from "../backend_sdk/user.sdk";
import { useNavigate } from "react-router-dom";
import { readImageFromS3WithNativeSdk, uploadImageToS3WithNativeSdk } from "../components/ImageHandlingS3";
import closeIconLogo from '../assets/closePhotoIcon.svg';
import addIconLogo from '../assets/addPhotoIcon.svg';
import {acceptedFileTypesPhotos, availableGames} from '../constants/utils'
import imageCompression from 'browser-image-compression'
import GameRegister from "../components/GameRegister";
import { Conversation } from "../backend_sdk/conversation.sdk";
import {BsFillDice6Fill} from 'react-icons/bs'
import { Message } from "../backend_sdk/message.sdk";

function Profile(props) {

    const navigate = useNavigate()
    const [error, setError] = React.useState(null)
    const [user,setUser] = React.useState(null)

    const [photos,setPhotos] = React.useState(null)
    const [updatedPhotos,setUpdatedPhotos] = React.useState(null)
    const [photosUpdateActive,setPhotosUpdateActive] = React.useState(false)
    const [initialEditPhotos,setInitialEditPhotos] = React.useState(null)

    const [updatedName,setUpdatedName] = React.useState("")
    const [name,setName] = React.useState(null)
    const [nameUpdateActive,setNameUpdateActive] = React.useState(false)

    const [updatedGender,setUpdatedGender] = React.useState("")
    const [gender,setGender] = React.useState(null)
    const [genderUpdateActive,setGenderUpdateActive] = React.useState(false)

    const [updatedDescription,setUpdatedDescription] = React.useState("")
    const [description,setDescription] = React.useState(null)
    const [descriptionUpdateActive,setDescriptionUpdateActive] = React.useState(false)

    const [updatedGames,setUpdatedGames] = React.useState(null)
    const [games,setGames] = React.useState(null)
    const [gamesUpdateActive,setGamesUpdateActive] = React.useState(false)

    const [modal,setModal] = React.useState(false)

    const [navbarLoaded,setNavbarLoaded] = React.useState(false)

    const toggle = () => setModal(!modal)

    React.useEffect(()=>{

      async function loadUser(){
        const res = await User.getUserByToken(localStorage.getItem("apiToken"))
        if(!res || !res.success){
            console.log("error at get user by token");
            navigate("/auth/home");
            return;
        }

        var newPhotos = []
        var filePhotos = []
        var image1 = await readImageFromS3WithNativeSdk(res.user._id,"1")
        var image2 = await readImageFromS3WithNativeSdk(res.user._id,"2")
        var image3 = await readImageFromS3WithNativeSdk(res.user._id,"3")
        var image4 = await readImageFromS3WithNativeSdk(res.user._id,"4")
        

        newPhotos.push(image1.data)
        newPhotos.push(image2.data)
        filePhotos.push(image1.data)
        filePhotos.push(image2.data)
        if(image3.data.length > 100){
            newPhotos.push(image3.data)
            filePhotos.push(image3.data)
        }
        else{
          filePhotos.push("None")
        }
        if(image4.data.length >100){
            newPhotos.push(image4.data)
            filePhotos.push(image4.data)
        }
        else{
          filePhotos.push("None")
        }
        setUpdatedPhotos(filePhotos)

        setDescription(res.user.description)
        setUser(res.user)
        setPhotos(newPhotos)
        setName(res.user.name)
        setGender(res.user.gender)
        setGames(res.user.gamesSelected)

      }

      if(!user &&  !photos && !updatedPhotos){
        loadUser()
      }
    },[user,photos])

    async function handleLogout(event) {
        event.preventDefault();
        const res = await User.logout(localStorage.getItem("apiToken")).catch(
          (err) => {
            setError(err.msg);
            console.log(JSON.stringify(err));
    
            return;
          }
        );
    
        if (!res) {
          setError("Unknown error, please try again later");
          console.log("Error at the Database");
          return;
        }
        if (!res.success) {
          setError(res.msg);
          console.log(res.error);
          return;
        }
        localStorage.clear();
        navigate("/auth/home");
    }

    async function updateUser(newUser){
      const res = await User.updateUser(localStorage.getItem("apiToken"),newUser)
      if (!res || !res.success){
        console.log("error at update user")
        return
      }
    }

    async function deleteUser(){
      const conRes = await Conversation.deleteAll(localStorage.getItem("apiToken"))
      if(!conRes || !conRes.success){
        
        console.log("error at delete all conversations")
        return
      }

      const messagesRes = await Message.deleteAllByUserId(localStorage.getItem("apiToken"))
      {
        if(!messagesRes || !messagesRes.success){
          console.log("error at delete all messages")
          return;
        }
      }

      const images = await User.deleteUserFromS3(localStorage.getItem("apiToken"))
      if(!images || !images.success){
        console.log(images)
        console.log("error at delete images from s3")
      }

      const res = await User.delete(localStorage.getItem("apiToken"))
      if(!res || !res.success){
        console.log(res)
        console.log("error at delete user")
        return
      }


      localStorage.clear();
      navigate("/auth/home");
      
    }

    function calculateAge(date){
      var newDate = new Date(date);
      var nowDate = new Date();
      var ageDifMs = newDate - nowDate;
      var ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970)-1;
  }

  function checkColor(state){
    if(state){
      return "success"
    }
    return "secondary"
  }

  function checkPhotosColor(state){
    let numberOfPhotos=0
    for(let i=0;i<state.length;i++)
    {
      if(state[i].length >100){
        numberOfPhotos=numberOfPhotos+1
      }
    }
    if(numberOfPhotos >= 2){
      return "success"
      
    }
    return "secondary"
  }

  function checkGamesColor(state){
    if(state.length >= 5){
      return "success";
    }
    return "secondary"
  }


  async function handlePhotosSave(updatedPhotosArray){
    var image1DB = "None"
    var image2DB = "None"
    var image3DB = "None"
    var image4DB = "None"


    console.log(updatedPhotosArray)
    for(let i=0;i<updatedPhotosArray.length;i++){
        if(updatedPhotosArray[i].length > 10){
          if(image1DB.length <= 100){
            image1DB = updatedPhotosArray[i]
          }
          else{
            if(image2DB.length <=100 ){
              image2DB = updatedPhotosArray[i]
            }
            else{
              if(image3DB.length <= 100){
                image3DB = updatedPhotosArray[i]
              }
              else{
                image4DB = updatedPhotosArray[i]
              }
            }
          }
        }
    }
    await User.UploadImageToS3(image1DB,user._id,"Image1")
    await User.UploadImageToS3(image2DB,user._id,"Image2")
    await User.UploadImageToS3(image3DB,user._id,"Image3")
    await User.UploadImageToS3(image4DB,user._id,"Image4")
  }

    return(
        <div className="profile-body">
            <NavbarMain page="profile" navbarLoaded={navbarLoaded} setNavbarLoaded={setNavbarLoaded}/>
            {
              user && photos && name && gender && games && (description !== null) && navbarLoaded?
              <Container className="profile-body-container">
                <Card className="profile-title-main">Your profile</Card>
                <Card className="profile-picture-name">
                <CardBody className="profile-picture-name-card-body">
                <Container className="img-profile-picture">
                  <img src={photos[0]} alt="N/A" />
                </Container> 
                <Container className="user-name-gender-age">
                {
                  nameUpdateActive ? 
                  <div className="user-info-div-update">
                    <div className="user-info">
                      <div>Name: </div> 
                      <Input placeholder={name} onChange={(e)=>{
                        e.preventDefault();
                        setUpdatedName(e.target.value)
                      }}></Input>
                    </div>
                    
                    <div className="user-info-edit-buttons">
                    <Button color={checkColor(updatedName)} onClick={(e)=>{
                      e.preventDefault()
                      if(updatedName){
                        updateUser({name:updatedName})
                        setName(updatedName)
                        setNameUpdateActive(false)
                      }
                    }}>Save</Button>
                    <Button onClick={(e)=>{
                      e.preventDefault()
                      setNameUpdateActive(false)
                    }} outline>Cancel</Button>
                    </div>
                  </div>
                  :
                  <div className="user-info-div">
                  <div className="user-info">
                    <div>Name: </div>
                    <div>{name}</div>
                  </div>
                  <div className="user-info-edit-buttons">
                  <Button onClick={(e)=>{
                    e.preventDefault()
                    setNameUpdateActive(true)
                    setUpdatedName("")
                  }} color="success">
                    Edit
                  </Button>
                  </div>
                  </div>
                }
                {
                  genderUpdateActive ?
                  <div className="user-info-div-update">
                    <div className="user-info">
                      <div>Gender:</div>
                      <FormGroup id="gender-profile" tag="fieldset" style={{fontSize:"20px",display:"flex",justifyContent:"center",alignItems:"center",margin:"0px"}} onChange={(e)=>{
                        setUpdatedGender(e.target.value)
                        }}>
                        <FormGroup check>
                            <Label check>
                            <Input type="radio" value={"Male"}  name="radio1" />{' '}
                                Male
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                            <Input type="radio" value={"Female"} name="radio1" />{' '}
                                Female
                            </Label>
                        </FormGroup>
                        
                    </FormGroup>
                    </div> 
                      <div className="user-info-edit-buttons">
                      <Button color={checkColor(updatedGender)} onClick={(e)=>{
                        e.preventDefault()
                        if(updatedGender){
                          updateUser({gender:updatedGender})
                          setGender(updatedGender)
                          setGenderUpdateActive(false)
                        }
                      }}>Save</Button>
                      <Button onClick={(e)=>{
                        e.preventDefault()
                        setGenderUpdateActive(false)
                      }} outline>Cancel</Button>

                    </div>
                  </div>
                  :
                  <div className="user-info-div">
                    <div className="user-info">
                      <div>Gender:</div>
                      <div>{gender}</div>
                    </div>
                    <div className="user-info-edit-buttons">
                      <Button onClick={(e)=>{
                        e.preventDefault()
                        setGenderUpdateActive(true)
                        setUpdatedGender("")
                      }} color="success">
                        Edit
                      </Button>
                    </div>
                  </div>
                }
                <div className="user-info-div">
                  Age: {calculateAge(user.birthday)}
                </div>
                </Container>
                <Container className="description-container">
                  <Container className="description-title">
                    Your description
                  </Container>
                  {
                    descriptionUpdateActive ?
                    <Container className="description-content-wrapper">
                    <Input className="description-content" type="textarea" name="text" value={updatedDescription} style={{resize:"none"}} onChange={(e)=>{
                      e.preventDefault()
                      setUpdatedDescription(e.target.value)
                    }}>
                    </Input>
                    <div className="description-edit-buttons">
                      <Button color="success" onClick={(e)=>{
                        e.preventDefault()
                        updateUser({description:updatedDescription})
                        setDescription(updatedDescription)
                        setDescriptionUpdateActive(false)
                      }}>
                        Save
                      </Button>
                      <Button outline onClick={(e)=>{
                        e.preventDefault()
                        setDescriptionUpdateActive(false)
                      }}>
                        Cancel
                      </Button>
                    </div>
                    </Container>
                    :
                    <Container className="description-content-wrapper">
                    <Input className="description-content" type="textarea" name="text" value={description}  placeholder="You don't have a description, add something to increase your chances of being picked by other players" disabled style={{resize:"none"}}>
                    </Input>
                    <div className="description-edit-buttons">
                      <Button color="success" onClick={(e)=>{
                        e.preventDefault()
                        setUpdatedDescription(description)
                        setDescriptionUpdateActive(true)
                      }}>
                        Edit
                      </Button>
                    </div>
                    </Container>
                  }
                </Container>
                
                </CardBody>
                </Card>

                  <Card className="profile-photos-card">
                    <CardBody className="profile-photos-card-body">
                      <Container className="photos-card-title">Your photos</Container>
                    {
                      photosUpdateActive ?
                      <Container className="photos-card-container">
                        <Container className="photos-container">
                        {
                          
                            updatedPhotos.map((element,index)=>{
                              if(element.length >100 ){
                                return (
                                  <FormGroup  key={element+index} className="single-photo-container">
                                    <img src={element} alt="N/A" />
                                    <img src={closeIconLogo} className="remove-photo-icon-profile" onClick={(e)=>{
                                      e.preventDefault()
                                      let newUpdatedPhotos = updatedPhotos
                                      newUpdatedPhotos[index] = "None"
                                      setUpdatedPhotos([...newUpdatedPhotos])
                                    }}/>
                                  </FormGroup>
                                )
                              }
                              return (
                                <FormGroup  key={element+index} className="single-photo-container" style={{cursor:"pointer"}} onClick={(e)=>{
                                  document.querySelector(".photo"+String(index+1)+"-upload-profile").click()
                                }}>
                                <Input 
                                  type="file" 
                                  accept='image/*' 
                                  className={"photo"+String(index+1)+"-upload-profile"} 
                                  hidden 
                                  onChange={async (event)=>{
                                      event.preventDefault()
                                      if(event.target.files &&  acceptedFileTypesPhotos.includes(event.target.files[0].type)){
                                        let newUpdatedPhotos = updatedPhotos
                                        const options = {
                                          maxSizeMB: 0.5,
                                          maxWidthOrHeight: 1024
                                        }
                                        try{
                                          const compressedFile = await imageCompression(event.target.files[0],options)
                                          var reader = new FileReader();
                                          reader.readAsDataURL(compressedFile);
                                          reader.onload = function () {
                                              newUpdatedPhotos[index] = reader.result
                                              setUpdatedPhotos([...newUpdatedPhotos])
                                              console.log(newUpdatedPhotos)
                                          };
                                          reader.onerror = function (error) {
                                            console.log('Error: ', error);
                                          };
                                          
                                        }
                                        catch (error) {
                                          console.log(error)
                                        }
                                      }
                                      event.target.value=null
                                  }}
                                  />
                                  <img src={addIconLogo} className="add-photo-icon-profile" cursor="pointer"/>
                                </FormGroup>
                              )
                          })
                  
                        }
                        </Container>
                        <Container style={{textAlign:"center"}}>Please have at least two active photos to continue</Container>
                        <Container className="photos-edit-buttons">
                          <Button color={checkPhotosColor(updatedPhotos)} onClick={(e)=>{
                            e.preventDefault()
                            let numberOfPhotos=0
                            for(let i=0;i<updatedPhotos.length;i++)
                            {
                              if(updatedPhotos[i].length >100){
                                numberOfPhotos=numberOfPhotos+1
                              }
                            }
                            if(numberOfPhotos >= 2){
                                handlePhotosSave(updatedPhotos)
                                var newNormalPhotos = []
                                for(let i=0;i<updatedPhotos.length;i++){
                                  if(updatedPhotos[i].length >10){
                                     newNormalPhotos.push(updatedPhotos[i])
                                  }
                                }
                                setPhotos([...newNormalPhotos])
                                setInitialEditPhotos(null)
                                setPhotosUpdateActive(false)
                            }
                          }}>Save</Button>
                          <Button outline onClick={(e)=>{
                            e.preventDefault()
                            setPhotosUpdateActive(false)
                            setUpdatedPhotos([...initialEditPhotos])
                            setInitialEditPhotos(null)
                          }}>Cancel</Button>
                        </Container>
                      </Container>
                      :
                      <Container className="photos-card-container">
                        <Container className="photos-container">
                        {
                          
                            photos.map((element,index)=>{
                              return (<img src={element} key={element+index} alt="N/A" style={{width:"150px",margin:"10px",height:"180px",borderRadius:"15px",border:"solid"}}/>)
                          })
                  
                        }
                        </Container>
                        <Container style={{textAlign:"center",color:"white",cursor:"default"}}>Please have at least two active photos to continue</Container>
                        <Container className="photos-edit-buttons">
                          <Button color="success" onClick={(e)=>{
                            e.preventDefault()
                            setPhotosUpdateActive(true)
                            setInitialEditPhotos([...updatedPhotos])
                          }}>Edit</Button>
                        </Container>
                      </Container>
                    }
                    </CardBody>
                  </Card>
                  <Card className="games-profile-card">
                    <CardTitle tag="h2">Your games</CardTitle>
                    <CardBody className="profile-games-card-body">
                    {
                      gamesUpdateActive ?
                      <Container className="games-wrapper">
                        <Container className="games-container">
                          {
                            availableGames.map((element,index)=>{
                                console.log(availableGames.length)
                                return (<GameRegister key={element} name={element} isSelected={updatedGames.includes(index)} onClick={()=>{
                                  if(updatedGames.includes(index)){
                                    let newList = [...updatedGames];
                                    const result = newList.filter(game => game != index)
                                    setUpdatedGames(result);
                                  }
                                  else{
                                    let newlist = [...updatedGames];
                                    newlist.push(index);
                                    setUpdatedGames(newlist);
                                  }
                                }}/>)                            
                            })
                          }
                        </Container>
                        <Container style={{textAlign:"center"}}>Please have at least 5 games selected to continue</Container>
                        <Container className="games-edit-buttons">
                          <Button color={checkGamesColor(updatedGames)} onClick={(e)=>{
                            e.preventDefault()
                            if(updatedGames.length >= 5){
                              updateUser({gamesSelected:updatedGames})
                              setGames([...updatedGames])
                              setGamesUpdateActive(false)
                            }
                          }}>Save</Button>
                          <Button color="secondary" outline onClick={(e)=>{
                            e.preventDefault()
                            setGamesUpdateActive(false)
                          }}>Cancel</Button>
                        </Container>
                      </Container>
                      :
                      <Container className="games-wrapper">
                        <Container className="games-container">
                        {
                          games.map((element,index)=>{
                            return (<GameRegister key={element} name={availableGames[element]}  isSelected = {true} />)
                          })
                        }
                        </Container>
                        <Container style={{textAlign:"center",color:"white",cursor:"default"}}>Please have at least 5 games selected to continue</Container>
                        <Container className="games-edit-buttons">
                          <Button color="success" onClick={(e)=>{
                            e.preventDefault()
                            setGamesUpdateActive(true)
                            setUpdatedGames([...games])
                          }}>Edit</Button>
                        </Container>
                      </Container>
                    }
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="profile-logout-delete-buttons">
                      <Button onClick={handleLogout}>
                        Sign out
                      </Button>
                      <Button color="danger" onClick={toggle}>
                        Delete Account
                      </Button>
                      <Modal isOpen={modal} toggle={toggle} >
                      <ModalHeader toggle={toggle}>Delete account</ModalHeader>
                      <ModalBody> Warning! This action will permanently delete your account with no chance to retrieve it. Are you sure you want to continue?</ModalBody>
                      <ModalFooter>
                        <Button color="danger" onClick={(e)=>{
                          e.preventDefault()
                          deleteUser()
                        }}>
                          Yes
                        </Button>
                        <Button onClick={toggle}>
                          No
                        </Button>
                      </ModalFooter>
                      </Modal>
                    </CardBody>
                  </Card>
                </Container>
                :
                <Container className="loading-profile">
                  <Container className="loading-icon"><BsFillDice6Fill size={70}/></Container>
                  <Container className="loading-text">Loading...</Container>
                </Container>
            }
            <Footer/>  
        </div>
    )
}

export default Profile