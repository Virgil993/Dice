import {io} from 'socket.io-client'


fetch("http://dicegames.ro:3000").then(response => response.json()).then(data => {
    console.log("Fetch response")
    console.log(data)
}).catch(err => {
    console.log("fetch error")
    console.log(err)
})

export const socket = io('http://dicegames.ro:3000')