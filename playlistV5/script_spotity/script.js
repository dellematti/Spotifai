// const client_id = "<Client ID>"
// const client_secret = "<Client Secret>"

const client_id = "<01b0fce0f670452fba1577e7fbdad307>"
const client_secret = "<647495df09ac4354b9acf7aa883947e7>" // questo secret non è più valido, generarne un altro
var url = "https://accounts.spotify.com/api/token"
fetch(url, {
    method: "POST",
    headers: {
        Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
        "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({ grant_type: "client_credentials" }),
})
    .then((response) => response.json())
    .then((tokenResponse) =>
        console.log(tokenResponse.access_token)
    )
    //per ora ho salvato come script direttamente in indexV3





