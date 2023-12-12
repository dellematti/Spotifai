
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