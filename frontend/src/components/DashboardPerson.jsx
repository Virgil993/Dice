import React from "react"
import { Container,Card,CardTitle, Button, CardText } from "reactstrap"
import '../styles/dashboard_person.css'
import { availableGames } from "../constants/utils"
import { User } from "@genezio-sdk/DiceBackend_us-east-1"
import { Conversation } from "@genezio-sdk/DiceBackend_us-east-1"


function DashboardPerson(props){


    const [commonGames,setCommonGames] = React.useState(null)
    const [commonGamesLoaded,setCommonGamesLoaded] = React.useState(false)
    const [moreUsersAvailable,setMoreUsersAvailable] = React.useState(true)

    React.useEffect(()=>{
        if(props.noMoreUsers){
            setMoreUsersAvailable(false)
        }
    },[moreUsersAvailable])


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


    function calculateAge(date){
        var newDate = new Date(date);
        var nowDate = new Date();
        var ageDifMs = newDate - nowDate;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970)-1;
    }

    async function updateUser(saidYes){
        const token = localStorage.getItem("apiToken")
        if(saidYes){
            const response = await User.updateSaidTo(token,props.userId,true);
            if(!response || !response.success)
            {
                console.log("error at update user")
                return;
            }

            const conversationResponse = await User.shouldCreateConversation(token,props.userId)
            if(!conversationResponse || !conversationResponse.success)
            {
                console.log("error at should create conversation")
                console.log(conversationResponse)
                return;
            }
            console.log(conversationResponse)
            if(conversationResponse.success && conversationResponse.shouldCreate){
                const createConv = await Conversation.create(token,[props.connectedUser._id,props.userId])
                if (!createConv || !createConv.success){
                    console.log("error at create conversation")
                    return;
                }
            }
        }
        else{
            const response = await User.updateSaidTo(token,props.userId,false);
            if(!response || !response.success)
            {
                console.log("error at update user")
                return;
            }
        }
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
                            updateUser(false)
                            if(props.indexInUsers<props.maxLength-1){
                                props.setIndexInUsers(props.indexInUsers+1)
                            }
                            else{
                                setMoreUsersAvailable(false)
                            }
                        }}>PASS</Button>
                        <Button className="buttons-choose" color="success" onClick={() => {
                            updateUser(true)
                            if(props.indexInUsers<props.maxLength-1){
                                props.setIndexInUsers(props.indexInUsers+1)
                            }
                            else{
                                setMoreUsersAvailable(false)
                            }
                        }}>PLAY</Button>
                    </Container>
                </Container>
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
