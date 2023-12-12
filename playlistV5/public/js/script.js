
// PRELOADER, VOLENDO POTREI ANCHE TOGLIERLO

(function ($) {
  "use strict";

  $(window).on("load", function () {
    // PreLoader Init
    function preLoader() {
      $("body").addClass("loaded");
      $(".preloader-wrapper").addClass("loaded");
    }
    preLoader();
  });

  $(document).ready(function () {
    // navbarToggle Init
    function navbarToggle() {
      $(".nav-toggle").on("click", function () {
        $(".sidenav").toggleClass("show");
        $(".nav-toggle span").toggleClass("fa-times fa-bars");
        $(".nav-toggle-overlay").toggleClass("show");
      });
      $(".nav-toggle-overlay").on("click", function () {
        $(".sidenav").removeClass("show");
        $(".nav-toggle span").toggleClass("fa-bars fa-times");
        $(".nav-toggle-overlay").removeClass("show");
      });
    }
    navbarToggle();

    // form validation (only for this page)
    window.addEventListener(
      "load",
      function () {
        var forms = document.getElementsByClassName("needs-validation");
        var validation = Array.prototype.filter.call(forms, function (form) {
          form.addEventListener(
            "submit",
            function (event) {
              if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
              }
              form.classList.add("was-validated");
            },
            false
          );
        });
      },
      false
    );
  });
})(jQuery);




// da qua iniziano le mie funzioni comuni a più parti


async function loginSiNo() {
  // con local storage dovrebbe restare loggato anche se chiudo il browser, ( con sessionStorage invece in teoria no)
  let loggato = localStorage.getItem("login")
  if (loggato == "true") {
    // document.getElementById("avvisoLogin").style.display="none";
    document.getElementById("in").style.display = "none";   //il tasto login non si deve vedere se sono loggato
    let nomeUtente = "";

    // ECCO LA RICHIESTA GET ALLA MIA API PER AVERE L USERNAME DATO L INDIRIZZO EMAIL (serve l await ??)
    await fetch('http://127.0.0.1:3000/users/username/' + localStorage.getItem("loginEmail"), {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((searchResults) => {
        nomeUtente = searchResults.username
      })
    // console.log(nomeUtente)

    document.getElementById("bottoneLogout").innerHTML = nomeUtente
    return true;
  } else {
    document.getElementById("out").style.display = "none"; //invece se non sono loggato nascondo il tasto logout  
    document.getElementById("linkArtisti").href = "/login";
    document.getElementById("linkPlaylist").href = "/login";
    return false;
  }
}


function logout() {
  localStorage.setItem("login", "false")
  localStorage.setItem("loginEmail", "")
}




function validitàToken(searchResults) {
  if (searchResults.error === undefined) {
    return true
    // } else if ( searchResults.error.message == "The access token expired") {
  } else if (searchResults.error.status == 401) {   //in teoria basta un else e non else if
    chiediToken()
    return false
  }
}




function chiediToken() {
  const client_id = "01b0fce0f670452fba1577e7fbdad307"
  const client_secret = "d9c85f1c2ee84aac8e45d80c44e1a0ea"
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
    .then((tokenResponse) => {
      localStorage.setItem("token", tokenResponse.access_token)
    })
}


//nella lista di canzoni ho le durate in ms, con questa funzione le converto in minuti e secondi
function msConversioneMin(millisecondi) {
  let secondi = millisecondi / 1000;
  if (Math.floor(secondi % 60) < 10)
    return Math.floor(secondi / 60) + ":0" + Math.floor(secondi % 60)
  else
    return Math.floor(secondi / 60) + ":" + Math.floor(secondi % 60)
}





// metto nei menu dropdown della lista di canzoni, tutte le playlist dell utente (lista di canzoni dell album o
// le più ascoltate di un artista)
// (questa funzione va a modificare il menu dropdown della card di default, non vedrò quella card ma sarà lei
// ad essere duplicata per le varie canzoni)
async function elencoPlaylistDropdown() {
  let email = localStorage.getItem("loginEmail")
  await fetch('http://127.0.0.1:3000/playlist/playlistUtente/' + email, {  // prendo tutte le playlist di un utente
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      let nomiPlaylist = searchResults;
      for (var i = 0; i < nomiPlaylist.length; i++) {
        document.getElementById("sceltaPlaylist").innerHTML = nomiPlaylist[i].nomePlaylist
        var card = document.getElementById("sceltaPlaylist")
        var clone = card.cloneNode(true)
        clone.classList.remove('d-none');
        card.after(clone);
      }
    })
}



// questa servirà ad agguingere la canzone ad una determinata playlist
function inserisciInPlaylist(nomePlaylist, idCanzone) {
  let email = localStorage.getItem("loginEmail")
  // ora so l id della canzone, l email e il nome della plylist, posso aggiungere al db

  let data = {
    emailUtente: email,
    idCanzone: idCanzone,
    nomePlaylist: nomePlaylist
  }
  fetch("http://127.0.0.1:3000/playlist?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("canzone inserita nella playlist")
    } else {
      response.text().then(text =>
        alert(text + "problema inserire canzone nella playlist")
      )
    }
  })
}




// carica tutti gli album/single dell artista 
// passare alla funzione la stringa "album" per ricevere gli album, la stringa "single" per i singoli
function albumArtista(tipoAlbum) {
  let tmp = new URLSearchParams(location.search);
  let artistaID = tmp.get("artista")
  fetch('https://api.spotify.com/v1/artists/' + artistaID + '/albums?include_groups=' + tipoAlbum + '&limit=50', {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      var card = document.getElementById("card-" + tipoAlbum);
      var cont = document.getElementById(tipoAlbum + "Container");
      cont.innerHTML = "";
      cont.append(card)
      for (var i = 0; i < searchResults.total; i++) {  // qua cè total e non length !!
        var clone = card.cloneNode(true)
        clone.id = "artista_" + tipoAlbum + i;
        clone.getElementsByClassName("card-title")[0].innerHTML = searchResults.items[i].name;
        clone.getElementsByClassName("card-text")[0].innerHTML = searchResults.items[i].artists[0].name;
        clone.getElementsByClassName("card-img")[0].src = searchResults.items[i].images[0].url;
        clone.getElementsByClassName('text-muted')[0].innerHTML = searchResults.items[i].album_group;
        clone.getElementsByClassName('stretched-link')[0].href = "/album?album=" + searchResults.items[i].id;
        clone.classList.remove('d-none');
        card.before(clone);
      }
    }
    )

}



// controlla se l artista è uno dei preferiti, se si modifica il bottone da "aggiungi a preferiti" a "rimuovi da preferiti"
// chiamato nella pagina artista
async function controllaPreferiti() {
  if (loggato != true) return; //se non sono loggato non controllo
  let tmp = new URLSearchParams(location.search);
  let artistaID = tmp.get("artista")

  let email = localStorage.getItem("loginEmail")
  let presente = false;
  await fetch("http://127.0.0.1:3000/artista/artistaPreferito/" + artistaID + "/" + email, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      if (searchResults) {
        document.getElementById("bottonePreferiti").value = "rimuovi dai preferiti"
        document.getElementById("bottonePreferiti").setAttribute("onclick", "rimuoviPreferiti(this);return false;");
      } else {
        console.log("L artista non era tra i preferiti")
      }
    })
}



// rimuove l artista dalla lista degli artisti preferiti dell utente
// chiamata nella pagina artista
async function rimuoviPreferiti(card) {
  let tmp = new URLSearchParams(location.search);
  let artistaID = tmp.get("artista")

  let email = localStorage.getItem("loginEmail")
  await fetch("http://127.0.0.1:3000/artista/artistaPreferito/" + artistaID + "/" + email, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      //se il record è stato effettivamente eliminato, allora searchResults.acknowledged == true
      if (searchResults.acknowledged) {
        document.getElementById("bottonePreferiti").value = "aggiungi ai preferiti"
        document.getElementById("bottonePreferiti").setAttribute("onclick", "aggiungiPreferiti(this);return false;");
      } else {
        console.log("Il record non è stato eliminato correttamente dal database")
      }
    })
}



// chiamato nella pagina artista
function aggiungiPreferiti(card) {
  let email = localStorage.getItem("loginEmail")
  let idArtista = card.name

  let data = {
    emailUtente: email,
    idArtista: idArtista
  }
  fetch("http://127.0.0.1:3000/artista?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("l artista è stato inserito nei preferitit")
      document.getElementById("bottonePreferiti").value = "rimuovi dai preferiti"
      document.getElementById("bottonePreferiti").setAttribute("onclick", "rimuoviPreferiti(this);return false;");
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da artista.html")
      )
    }
  })
}






// dato l id dell artista genero le card contenenti le info delle traccie, sono le card laterali
// chiamato nella pagina artista
function listaCanzoniArtista(artistaID) {
  fetch("https://api.spotify.com/v1/artists/" + artistaID + "/top-tracks?market=Us", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      var card = document.getElementById("card-canzone");
      var cont = document.getElementById("canzoneContainer");
      cont.innerHTML = "";
      cont.append(card)
      for (var i = searchResults.tracks.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true)
        clone.id = "numeroCanzone" + i;
        clone.getElementsByClassName("card-title")[0].innerHTML = searchResults.tracks[i].name;
        clone.getElementsByClassName('text-muted')[0].innerHTML = msConversioneMin(searchResults.tracks[i].duration_ms);


        // l id di ogni "aggiungi a playlist", sarà l id della canzone 
        //devo metterlo a tutti i dropdown da 1 in poi (0 è quello sovrascritto)
        // sarebbe meglio non mettere id uguali, magari trovare altro in cui metterlo
        for (var j = 1; j < clone.getElementsByClassName('dropdown-item').length; j++) {
          clone.getElementsByClassName('dropdown-item')[j].setAttribute("id", searchResults.tracks[i].id);
        }
        clone.classList.remove('d-none');
        card.after(clone);

      }
    }
    )
}





// questa funzione serve solo per prendere dal backend la lista di artisti preferiti dell utente
// chiamata in listaArtisti.html
function caricaArtistiPreferiti() {
  fetch('http://127.0.0.1:3000/listaArtistiPreferiti/' + localStorage.getItem("loginEmail"), {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      if (searchResults.length > 0)
        popolaArtistiPreferiti(searchResults)
      // se non ho risultati posso modificare un qualche div per scrivere all interno della pagina di aggiungere gli artisti
    })
}



// ricevo un array di id con gli artisti preferiti e popolo la pagina
// chiamata in listaArtisti.html
function popolaArtistiPreferiti(artisti) {
  console.log("Sono in popolaArtisti")
  // controllare il token prima di fare la fetch all api di spotify

  for (var i = 0; i < artisti.length; i++) {
    var card = document.getElementById("card-preferiti");
    var cont = document.getElementById("preferitiContainer");
    cont.innerHTML = "";
    cont.append(card)
    fetch('https://api.spotify.com/v1/artists/' + artisti[i].idArtista, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((searchResults) => {
        var clone = card.cloneNode(true)
        clone.id = "idArtista" + searchResults.id;
        clone.getElementsByClassName("card-title")[0].innerHTML = searchResults.name;
        clone.getElementsByClassName("card-img")[0].src = searchResults.images[0].url;
        clone.getElementsByClassName('stretched-link')[0].href = "/artista?artista=" + searchResults.id;
        clone.classList.remove('d-none');
        card.after(clone);
      })
  }
}


// pagina UTENTE


// chiamata da utente.html
function nuovaPassword() {
  let email = localStorage.getItem("loginEmail")
  var password1 = document.getElementById('passwordVecchia')
  var password2 = document.getElementById('passwordNuova1')
  var password3 = document.getElementById('passwordNuova2')

  if (password1.value != password2.value || password1.value.length < 7) {
    password1.classList.add('border')
    password1.classList.add('border-danger')
    password2.classList.add('border')
    password2.classList.add('border-danger')
  } else {
    password1.classList.remove('border')
    password1.classList.remove('border-danger')
    password2.classList.remove('border')
    password2.classList.remove('border-danger')
  }

  var data = {
    email: email,
    vecchiaPassword: password1.value,
    nuovaPassword: password3.value,
  }
  console.log(data)
  fetch("http://127.0.0.1:3000/users/aggiornaPassword?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("la password è stata modificata")
      window.location.href = "/"
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da utente.html")
      )
    }
  })


}





// cambia l username dell utente se la password è corretta
// chiamata da utente.html
function nuovoUsername() {
  let email = localStorage.getItem("loginEmail")
  var username = document.getElementById('username')
  var password = document.getElementById('password')

  if (password.value.length < 7) {
    password.classList.add('border')
    password.classList.add('border-danger')
  } else {
    password.classList.remove('border')
    password.classList.remove('border-danger')
  }

  var data = {
    username: username.value,
    email: email,
    password: password.value,
  }

  fetch("http://127.0.0.1:3000/users/aggiornaUsername?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("l utente è stato modificato")
      window.location.href = "/"
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da utente.html")
      )
    }
  })

}




// chiamata da utente.html
function cancellaUtente() {
  let email = localStorage.getItem("loginEmail")
  fetch("http://127.0.0.1:3000/users/cancellaUtente/" + email, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    // body: JSON.stringify(data)  // dovrei cambiare e passare l email nel body, e NON come parametro
  }).then(async response => {
    if (response.ok) {
      console.log("l utente è stato cancellato")
      logout()
      window.location.href = "/"
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da utente.html")
      )
    }
  })
}

// serve per aprire e chiudere il form di cambio username 
// chiamata da utente.html
function cambioUsername() {
  if (document.getElementById("usernameForm").classList.contains("d-none")) {
    document.getElementById("usernameForm").classList.remove('d-none')
  } else {
    document.getElementById("usernameForm").classList.add('d-none')
  }
}


// serve per aprire e chiudere il form di cambio password
// chiamata da utente.html
function cambioPassword() {
  if (document.getElementById("passwordForm").classList.contains("d-none")) {
    document.getElementById("passwordForm").classList.remove('d-none')
  } else {
    document.getElementById("passwordForm").classList.add('d-none')
  }
}


// pagina registrazione

function registrati() {
  var email = document.getElementById('email')
  var password1 = document.getElementById('password1')
  var password2 = document.getElementById('password2')
  var username = document.getElementById('username')

  if (password1.value != password2.value || password1.value.length < 7) {
    password1.classList.add('border')
    password1.classList.add('border-danger')
    password2.classList.add('border')
    password2.classList.add('border-danger')
  } else {
    password1.classList.remove('border')
    password1.classList.remove('border-danger')
    password2.classList.remove('border')
    password2.classList.remove('border-danger')
  }

  var data = {
    username: username.value,
    email: email.value,
    password: password1.value,

  }
  console.log(data)

  fetch("http://127.0.0.1:3000/users/registrati?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      // se la post ha funzionato correttamente entriamo in questo if e facciamo un redirect
      window.location.href = "/"
      console.log("l utente è stato inserito nel database")
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da registrati.html")
      )
    }
  })


}

// pagina login
function login() {
  var email = document.getElementById('email')
  var password = document.getElementById('password')


  var data = {
    email: email.value,
    password: password.value,
  }
  console.log("provo il login" + data)

  fetch("http://127.0.0.1:3000/users/login?apikey=123456", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("ti sei loggato")
      localStorage.setItem("login", "true")
      localStorage.setItem("loginEmail", email.value)
      window.location.href = "/"
      // se mi sono loggato allora metto a true il valore di login nel localstorage, poi lo controllo nelle altre pagine
    } else {
      response.text().then(text =>
        alert(text + " login non ha funzionato")
      )

    }

  })




}



// ListaPlaylist


function rendiPrivata(bottonePlaylist) {
  bottonePlaylist.innerHTML = "Rendi pubblica"
  bottonePlaylist.setAttribute("onclick", "rendiPubblica(this)")

  let email = localStorage.getItem("loginEmail")
  let data = {
    emailUtente: email,
    nomePlaylist: bottonePlaylist.value,
  }
  fetch('http://127.0.0.1:3000/playlist/rendiPrivata/', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("la playlist ora è privata")
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da listaPlaylist.html")
      )
    }
  })
}


function rendiPubblica(bottonePlaylist) {
  bottonePlaylist.innerHTML = "Rendi privata"
  bottonePlaylist.setAttribute("onclick", "rendiPrivata(this)")

  let email = localStorage.getItem("loginEmail")
  let data = {
    emailUtente: email,
    nomePlaylist: bottonePlaylist.value,
  }
  fetch('http://127.0.0.1:3000/playlist/rendiPubblica/', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("la playlist ora è pubblica")
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da listaPlaylist.html")
      )
    }
  })
}




// controlla se esiste già una playlist con un certo nome associata all utente, se non c è la aggiunge
function controllaPlaylist() {
  var nome = document.getElementById('nuovaPlaylist').value;
  fetch('http://127.0.0.1:3000/playlist/playlistUtente/' + localStorage.getItem("loginEmail") + "/" + nome, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      console.log(searchResults)
      if (searchResults == false) nuovaPlaylist(nome);
      else alert("la playlist esiste già")
    })
}


// inserisce nel db una playlist nuova
async function nuovaPlaylist(nome) {
  let email = localStorage.getItem("loginEmail")

  let data = {
    emailUtente: email,
    nomePlaylist: nome,
    pubblica: true
  }
  await fetch('http://127.0.0.1:3000/playlist/playlistUtente/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(async response => {
    if (response.ok) {
      console.log("la playlist è stata inserita nel database olè")
    } else {
      response.text().then(text =>
        alert(text + " la risposta arriva da listaPlaylist.html")
      )
    }
  })
  location.reload() //avendo aggiunto una playlist devo ricaricare la pagina
}



// HOMEPAGE


// guardo gli artisti preferiti dell utente e ne cerco uno che possa piacergli
async function artistiConsigliati() {
  let loggato = localStorage.getItem("login")
  if (loggato == "true") {
    document.getElementById("concertiArtista").classList.remove('d-none');
    // ora prendo un artista preferito a caso tra quelli dell utente
    // se non ce nè nessuno scrivo di aggiungerli

    let email = localStorage.getItem("loginEmail")
    let idArtista;
    // prendo tutti gli artisti preferiti dell utente e ne scelgo uno a caso
    await fetch('http://127.0.0.1:3000/listaArtistiPreferiti/' + email, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((artisti) => {
        let random = Math.floor(Math.random() * artisti.length)  // numero casuale tra 0 e il numero di preferiti
        idArtista = artisti[random].idArtista
      })

    // ora posso caricare gli artisti consigliati
    let consigliati
    fetch("https://api.spotify.com/v1/artists/" + idArtista + "/related-artists", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((searchResults) => {
        let random = Math.floor(Math.random() * searchResults.artists.length)  // numero casuale tra 0 e in teoria sempre 20
        document.getElementById("artista").href = "/artista?artista=" + searchResults.artists[random].id;
        document.getElementById("imgArtista").src = searchResults.artists[random].images[0].url;
        document.getElementById("nomeArtista").innerHTML = searchResults.artists[random].name;
      })

    // chiedo le informazioni per avere il nome del mio artista motivo del suggerimento
    // RICONTROLLARE il token 
    fetch("https://api.spotify.com/v1/artists/" + idArtista, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((searchResults) => {
        document.getElementById("mioArtista").innerHTML = searchResults.name;
        document.getElementById("mioArtista").href = "/artista?artista=" + searchResults.id;
      })

  }

}




function nuoveUscite(country) {
  fetch('https://api.spotify.com/v1/browse/new-releases?country=' + country, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      if (validitàToken(searchResults)) {
        var card = document.getElementById("card-tendenze" + country);
        var cont = document.getElementById("tendenzeContainer" + country);
        cont.innerHTML = "";
        cont.append(card)
        for (var i = 5; i >= 0; i--) {
          var clone = card.cloneNode(true)
          clone.id = "numeroTendenza" + country + i;
          clone.getElementsByClassName("card-title")[0].innerHTML = searchResults.albums.items[i].name;
          clone.getElementsByClassName('link')[0].innerHTML = searchResults.albums.items[i].artists[0].name;
          clone.getElementsByClassName('second-link')[0].href = "/artista?artista=" + searchResults.albums.items[i].artists[0].id;
          clone.getElementsByClassName("card-img")[0].src = searchResults.albums.items[i].images[0].url;
          clone.getElementsByClassName('text-muted')[0].innerHTML = searchResults.albums.items[i].release_date;
          // metto il ref ad /album con allegato l id
          clone.getElementsByClassName('stretched-link')[0].href = "/album?album=" + searchResults.albums.items[i].id;
          clone.classList.remove('d-none');
          card.after(clone);
        }
      } else {
        // console.log("validità token ci ha dato false")
        nuoveUscite(country)    //ora che ho ripreso il token richiamo la funzione
      }
    }
    )
}




// PAGINA ARTISTA  (anche sopra c erano altre di artista?)


// carica la scheda dell artista e la lista delle canzoni più famose
function artista() {
  let tmp = new URLSearchParams(location.search); //prendo l id dell artista dall URL
  let artistaID = tmp.get("artista")

  // per le fetch a spotify dovrei sempre controllare che il token sia valido 

  fetch("https://api.spotify.com/v1/artists/" + artistaID, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      document.getElementsByClassName("card-title")[0].innerHTML = searchResults.name;
      document.getElementsByClassName("card-text")[0].innerHTML = searchResults.genres[0];
      document.getElementsByClassName("card-img")[0].src = searchResults.images[0].url;
      document.getElementById("bottonePreferiti").setAttribute("name", artistaID); //metto l id nel bottone  
      // se non sono loggato non mi serve il bottone dei preferiti
      if (loggato == false)
        document.getElementById("bottonePreferiti").remove();
      listaCanzoniArtista(artistaID)  //devo passare l id dell album per avere la lista delle canzoni
    })
}



// PAGINA ALBUM


function album() {
  let tmp = new URLSearchParams(location.search); //prendo il nome dell album dall URL, sarebbe meglio l ID
  let albumID = tmp.get("album")

  // prima di una fetch a spotify dovrei sempre controllare che il token sia valido
  fetch("https://api.spotify.com/v1/albums/" + albumID, {  //es : "http: .... ?type=album&q=The Wall"
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      var card = document.getElementById("card-album");
      card.getElementsByClassName("card-title")[0].innerHTML = searchResults.name;
      card.getElementsByClassName("card-text")[0].innerHTML = searchResults.artists[0].name;
      card.getElementsByClassName("card-img")[0].src = searchResults.images[0].url;
      card.getElementsByClassName('text-muted')[0].innerHTML = searchResults.release_date;
      card.getElementsByClassName('link')[0].href = "/artista?artista=" + searchResults.artists[0].id;
      listaCanzoni(albumID)  //devo passare l id dell album per avere la lista delle canzoni
    }
    )
}


// dato l id dell album genero le card contenenti le info delle traccie
function listaCanzoni(albumID) {
  fetch("https://api.spotify.com/v1/albums/" + albumID + "/tracks?limit=50", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((searchResults) => {
      var card = document.getElementById("card-canzone");
      var cont = document.getElementById("canzoneContainer");
      cont.innerHTML = "";
      cont.append(card)
      for (var i = searchResults.items.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true)
        clone.id = "numeroCanzone" + i;
        clone.getElementsByClassName("card-title")[0].innerHTML = searchResults.items[i].track_number + " " + searchResults.items[i].name;
        clone.getElementsByClassName('text-muted')[0].innerHTML = msConversioneMin(searchResults.items[i].duration_ms);
        for (var j = 1; j < clone.getElementsByClassName('dropdown-item').length; j++) {
          clone.getElementsByClassName('dropdown-item')[j].setAttribute("id", searchResults.items[i].id);
        }
        clone.classList.remove('d-none');
        card.after(clone);
      }
    }
    )
}
