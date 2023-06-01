import {io} from 'socket.io-client'


fetch("https://16.16.146.204:3000").then(response => response.json()).then(data => {
    console.log("Fetch response")
    console.log(data)
}).catch(err => {
    console.log("fetch error")
    console.log(err)
})

export const socket = io('https://16.16.146.204:3000')