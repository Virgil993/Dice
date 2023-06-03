import {io} from 'socket.io-client'


// fetch("https://dicegames.ro").then(response => response.json()).then(data => {
//     console.log("Fetch response")
//     console.log(data)
// }).catch(err => {
//     console.log("fetch error")
//     console.log(err)
// })

export const socket = io('https://dicegames.ro')