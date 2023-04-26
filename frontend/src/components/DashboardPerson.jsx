import React from "react"
import { Container,Card,CardBody,CardTitle, Button, CardText } from "reactstrap"
import '../styles/dashboard_person.css'
import Capture from "../assets/Capture.png"
import Capture2 from "../assets/Capture2.png"
import FsLightbox from "fslightbox-react"
import { availableGames } from "../constants/utils"
import { readImageFromS3WithNativeSdk } from "./ImageHandlingS3"


function DashboardPerson(props){

    const [lightboxController, setLightboxController] = React.useState({
        toggler: false,
        slide: 1
    });

    const [photos,setPhotos] = React.useState([])
    const [imagesLightbox,setImagesLightbox] = React.useState([])
    const [photosLoaded,setPhotosLoaded] = React.useState(false)
    const [commonGames,setCommonGames] = React.useState(null)
    const [commonGamesLoaded,setCommonGamesLoaded] = React.useState(false)
    const [moreUsersAvailable,setMoreUsersAvailable] = React.useState(true)

    React.useEffect(()=>{
        if(props.noMoreUsers){
            setMoreUsersAvailable(false)
        }
    },[moreUsersAvailable])

    React.useEffect(()=>{
        async function getImagesForUser(userId){
            var newPhotos = []
            var image1 = await readImageFromS3WithNativeSdk(userId,"1")
            var image2 = await readImageFromS3WithNativeSdk(userId,"2")
            var image3 = await readImageFromS3WithNativeSdk(userId,"3")
            var image4 = await readImageFromS3WithNativeSdk(userId,"4")
            
            var imagesArray = []

            var blob1 = new Blob([image1.Body],{type: "octet/stream"})
            var blob2 = new Blob([image2.Body],{type: "octet/stream"})
            newPhotos.push(URL.createObjectURL(blob1))
            newPhotos.push(URL.createObjectURL(blob2))
            imagesArray.push(
                <img src={URL.createObjectURL(blob1)} alt="Image1" width={"850px"} height={"850px"}/>,
                <img src={URL.createObjectURL(blob2)} alt="Image2" width={"850px"} height={"850px"}/>,
                )
            if(image3.ContentLength != 0){
                var blob3 = new Blob([image3.Body],{type: "octet/stream"})
                newPhotos.push(URL.createObjectURL(blob3))
                imagesArray.push(<img src={URL.createObjectURL(blob3)} alt="Image3" width={"850px"} height={"850px"}/>,)
            }
            if(image4.ContentLength != 0){
                var blob4 = new Blob([image4.Body],{type: "octet/stream"})
                newPhotos.push(URL.createObjectURL(blob4))
                imagesArray.push(<img src={URL.createObjectURL(blob4)} alt="Image4" width={"850px"} height={"850px"}/>,)
            }
            

            

            setImagesLightbox(imagesArray)
            setPhotos(newPhotos)
        }

        if(photos.length==0){
            getImagesForUser(props.user._id)
        }

    },[photos,imagesLightbox])


    React.useEffect(()=>{
        if(photos.length!=0){
            setPhotosLoaded(true)
        }
    },[photos,photosLoaded])

    React.useEffect(()=>{
        function elemCommon(a, b){
            return a.filter((element)=>{
              return b.includes(element)
            })
          }
        if(!commonGames){
            setCommonGames(elemCommon(props.gamesSelected,props.user.gamesSelected)) 
        }
    },[commonGames])

    React.useEffect(()=>{
        if(commonGames){
            setCommonGamesLoaded(true)
        }
    },[commonGames,commonGamesLoaded])

    function openLighboxOnSlide(number) {
        setLightboxController({
            toggler: !lightboxController.toggler,
            slide: number
        })
    }

    function calculateAge(date){
        var newDate = new Date(date);
        var nowDate = new Date();
        var ageDifMs = newDate - nowDate;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970)-1;
    }



    return(
        moreUsersAvailable ?
        <Container className="dasboard-person-body">
            <Card className="card-main">
                <Container className="name-card-main">
                    <Container className="container-header-card-main">
                    <h2>{props.user.name} {calculateAge(props.user.birthday)}</h2>
                    <h4>{props.user.gender}</h4>
                    </Container>
                    <Container className="container-actions-card-main">
                        <Button className="buttons-choose" onClick={() => {
                            if(props.indexInUsers<props.maxLength-1){
                                props.setIndexInUsers(props.indexInUsers+1)
                            }
                            else{
                                setMoreUsersAvailable(false)
                            }
                        }}>PASS</Button>
                        <Button className="buttons-choose" color="success" onClick={() => {
                            if(props.indexInUsers<props.maxLength-1){
                                props.setIndexInUsers(props.indexInUsers+1)
                            }
                            else{
                                setMoreUsersAvailable(false)
                            }
                        }}>PLAY</Button>
                    </Container>
                </Container>
                {
                    photosLoaded ?
                    <Container className="photos-card-main">
                    {
                        photos.map((element,index)=>{
                            return (<img src={element} key={element+index} alt="N/A" style={{width:"200px",margin:"10px",height:"230px",cursor:"pointer",borderRadius:"15px"}} onClick={()=>{
                                openLighboxOnSlide(index+1)
                            }}/>)
                        })
                    }
                    <FsLightbox
                        toggler={lightboxController.toggler}
                        sources={imagesLightbox}
                        slide={lightboxController.slide}
                    />
                    </Container>
                    :
                    <Container style={{height:"250px"}}></Container>
                }
            </Card>
            <Container className="container-desc-compat">
            <Card className="card-desc">
                <CardTitle tag="h2" style={{margin:"20px"}}>Description</CardTitle>
                {
                    props.user.description ?
                    <CardText style={{margin:"20px"}}>
                    {props.user.description}
                    </CardText>
                    :
                    <CardText style={{margin:"20px"}}>
                        Unfortunately this user dosen't have a description. Don't worry, if you both decide to play together you can find out more about him thorugh chatting
                    </CardText>
                }
            </Card>
            <Card className="card-compat">
                <CardTitle tag="h2" style={{margin:"20px"}}>Compatibility</CardTitle>
                {
                    commonGamesLoaded && commonGames.length!=0 ?
                    <Container>
                    <CardText style={{textAlign:"center",marginTop:"20px"}}>Good news! You both have some games that you can enjoy together</CardText>
                    <CardText style={{textAlign:"center"}}>Here are the games that you both like</CardText>
                    <Container className="common-games-container">
                    {
                        commonGames.map((element,index)=>{
                            return(
                                <Container className="game-dashboard" key={element}>{availableGames[element]}</Container>
                            )
                        })
                    }
                    </Container>
                    </Container>
                    :
                    <CardText style={{textAlign:"center",margin:"20px"}}>We couldn't find any common games between the two of you, don't worry, you can still talk thorugh our chat and find out if you want to play something new together </CardText>
                }
            </Card>
            </Container>
        </Container>
        :
        <Container style={{textAlign:"center",margin:"200px",marginBottom:"300px",fontSize:"30px"}}>
            Oops, there are no more available users right now. Try again later to find new players to enjoy your games with!
        </Container>
        
    )
}

export default DashboardPerson
