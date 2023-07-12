const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const auth = require('./auth').auth
const crypto = require('crypto')
var cors = require('cors')
const express = require('express')
const path = require('path');
const uri = "mongodb+srv://dellematti:pangolino@utentispotifai.tprldau.mongodb.net/"
const db = "spotifai"

const app = express()
app.use(cors())
// app.use(auth) Per avere apikey su tutti gli endpoint
app.use(express.json())

app.use(express.static("./public"));




function hash(input) {
    return crypto.createHash('md5')
        .update(input)
        .digest('hex')
}

// Ricerca nel database
// app.get('/users/:id', auth, async function (req, res) {
//     var id = req.params.id
//     var pwmClient = await new mongoClient(uri).connect()
//     var user = await pwmClient.db("pwm")
//         .collection('users')
//         .find({ "_id": new ObjectId(id) })
//         .project({ "password": 0 })
//         .toArray();
//     res.json(user)
// })


// delete e update non so se servono  (?)
// function deleteUser(res, id) {
//     let index = users.findIndex(user => user.id == id)
//     if (index == -1) {
//         res.status(404).send("User not found")
//         return
//     }
//     users = users.filter(user => user.id != id)
// 
//     res.json(users)
// }


app.get('/users', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var users = await pwmClient.db("pwm").collection('users').find().project({ "password": 0 }).toArray();
    res.json(users)

})

// da qua sono le mie api


// per registrarsi
app.post("/users/registrati", auth, async function (req, res) {
    console.log("sono nel post di user")
    let user = req.body

    if (!user.username) {
        res.status(400).send("Missing userName")
        return
    }
    if (!user.email) {
        res.status(400).send("Missing Email")
        return
    }
    if (!user.password || user.password.length < 3) {
        res.status(400).send("Password is missing or too short")
        return
    }

    user.password = hash(user.password)
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('utenti').findOne({ email: user.email })
        if (presente) {
            res.status(400).send("utente " + user.email + " è già presente")
        } else {
            var items = await pwmClient.db(db).collection('utenti').insertOne(user)
            res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})



// questa serve per fare il login, controllo se email e password sono nel db
app.post("/users/login", auth, async function (req, res) {
    var user = req.body
    if (!user.email) {
        res.status(400).send("Missing Email")
        return
    }
    if (!user.password) {
        res.status(400).send("Password is missing or too short")
        return
    }

    user.password = hash(user.password)
    console.log(user)
    var pwmClient = await new mongoClient(uri).connect()

    try {
        var presente = await pwmClient.db("spotifai").collection('utenti').findOne({ email: user.email, password: user.password })
        if (presente) {
            res.send(presente)
        } else {
            res.status(401).send("login non riuscito")
            // res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})




// api per avere l username dell utente dato un indirizzo email, rispondo con un json formato {username: valore}
app.get("/users/username/:id", async function (req, res) {
    const email = req.params.id;  //id della richiesta è l email utente, ora posso vedere qual è il suo username
    var pwmClient = await new mongoClient(uri).connect()

    try {
        var utente = await pwmClient.db("spotifai").collection('utenti').findOne({ email: email })
        if (utente) {
            res.send({ username: utente.username })
        } else {
            res.status(401).send("indirizzo email non presente")
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});




app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/indexV3.html'));   
});

app.get('/registrati', function (req, res) {
    res.sendFile(path.join(__dirname, '/registratiV2.html'));
});

app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, '/loginV2.html'));
});

app.get('/risultati', function (req, res) {
    res.sendFile(path.join(__dirname, '/risultati.html'));
});

app.get('/album', function (req, res) {
    res.sendFile(path.join(__dirname, '/album.html'));
});

app.get('/artista', function (req, res) {
    res.sendFile(path.join(__dirname, '/artista.html'));
});

app.get('/listaArtistiPreferiti', function (req, res) {  //qua avremo la pagina con tutti gli artisti preferiti dell utente
    res.sendFile(path.join(__dirname, '/listaArtisti.html'));
});

app.get('/listaPlaylist', function (req, res) {  //qua avremo la pagina con tutte le playlist
    res.sendFile(path.join(__dirname, '/listaPlaylist.html'));
});

app.get('/playlist', function (req, res) {  // pagina con una singola playlist
    res.sendFile(path.join(__dirname, '/playlist.html'));
});

app.get('/utente', function (req, res) {  // pagina per la gestione utente
    res.sendFile(path.join(__dirname, '/utente.html'));
});

app.get('/playlistPubbliche', function (req, res) {  // pagina con tutte le playlist pubbliche dei vari utenti
    res.sendFile(path.join(__dirname, '/playlistPubbliche.html'));
});





// api che dato l id (email) dell utente restituisce un array con gli id degli artisti preferiti, se l utente
// non ha artisti preferiti, restituisce l array vuoto
app.get('/listaArtistiPreferiti/:idUtente', async function (req, res) {
    console.log(req.params.idUtente)
    let id = req.params.idUtente
    let pwmClient = await new mongoClient(uri).connect()
    try {
        // faccio la project perche restituisco solo l id dell artista, non anche la email utente
        let artisti = await pwmClient.db("spotifai").collection('artistiPreferiti').find({ emailUtente: id }).project({ emailUtente: 0, _id: 0 }).toArray()
        res.send(artisti)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});






// dice, dato l id dell artista, se è uno dei preferiti oppure no
// anche se funziona scritta così  :id/:email  è terribile o ci può stare ???? CONTROLLARE
app.get("/artista/artistaPreferito/:id/:email", async function (req, res) {
    // console.log("l artista è tra i preferiti? " ,req.params)
    var pwmClient = await new mongoClient(uri).connect()

    try {
        var presente = await pwmClient.db("spotifai").collection('artistiPreferiti').findOne({ emailUtente: req.params.email, idArtista: req.params.id })

        if (presente) {
            res.send(presente)
        } else {
            res.send(false)
            // res.status(401).send("login non riuscito")
            // res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };

});



// metto l id dell artista nel database, associato all email dell utente come chiave (ricevo idartista ed email)
app.post("/artista", auth, async function (req, res) {

    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email")
        return
    }
    if (!req.body.idArtista) {
        res.status(400).send("Manca l id dell artista")
        return
    }


    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('artistiPreferiti').findOne({ emailUtente: req.body.emailUtente, idArtista: req.body.idArtista })
        if (presente) {
            res.status(400).send("il record è già presente")  //devo restituire un errore se è già presente? credo di si
        } else {
            var items = await pwmClient.db(db).collection('artistiPreferiti').insertOne(req.body)
            res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
    // res.end()
})



// api che data l email e l id dell artista, cancella dal db dei preferiti quell artista, associato a quell email
// app.delete('/user', (req, res) => {
app.delete("/artista/artistaPreferito/:id/:email", async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()   // è giusto dichiarare ogni volta la stessa var  ?????????

    try {
        let risultato = await pwmClient.db("spotifai").collection('artistiPreferiti').deleteOne({ emailUtente: req.params.email, idArtista: req.params.id });
        // if (risultato.acknowledged == "true")
        if (risultato.acknowledged) {
            res.json(risultato)
        } else {
            res.status(400).send("il record non era presente all interno del db")
        }
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    }
})



// PLAYLIST

// controlla se per l utente esiste una determinata playlist, richiede l id della playlist (il nome) e l email dell utente
app.get("/playlist/playlistUtente/:id/:email", async function (req, res) {
    console.log("get che determina l esistenza di una playlist nel db utente")
    let pwmClient = await new mongoClient(uri).connect()

    try {
        let presente = await pwmClient.db("spotifai").collection('playlist').findOne({ emailUtente: req.params.email, nomePlaylist: req.params.id })
        if (presente) {
            res.send(presente)
        } else {
            res.send(false)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});




// restituisce tutte le playlist di un utente
app.get("/playlist/playlistUtente/:email", async function (req, res) {
    // console.log(req.params.email)
    let id = req.params.email
    let pwmClient = await new mongoClient(uri).connect()
    try {
        // faccio la project perche restituisco solo l il nome della playlist, non anche la email utente
        let playlist = await pwmClient.db("spotifai").collection('playlist').find({ emailUtente: id }).project({ emailUtente: 0, _id: 0 }).toArray()
        res.send(playlist)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});


// restituisce tutte le playlist pubbliche esistenti
app.get("/playlist/playlistPubbliche", async function (req, res) {
    let pwmClient = await new mongoClient(uri).connect()
    try {
        // faccio la project perche restituisco solo l il nome della playlist, non anche la email utente
        let playlist = await pwmClient.db("spotifai").collection('playlist')
            .find({ pubblica: true }).project({pubblica: 0,  _id: 0 }).toArray()
        res.send(playlist)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});




// restituisce tutte le canzoni di una determinata playlist di un determinato utente, restituisco un array (vuoto in caso la
// playlist sia vuota)
// accetta anche un terzo parametro "numero" che dice la quantità di canzoni da restituire
app.get("/playlist/:emailUtente/:nomePlaylist/:numero?", async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    try {
        let canzoni = await pwmClient
            .db("spotifai")
            .collection('canzoniPlaylist')
            .find({ emailUtente: req.params.emailUtente, nomePlaylist: req.params.nomePlaylist })
            .project({ emailUtente: 0, _id: 0, nomePlaylist: 0 })
            .toArray()
        if (!req.params.numero)
            res.send(canzoni)
        else res.send(canzoni.slice(0, req.params.numero))
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});



// restituisce tutte le playlist esistenti con un determinato nome , 
// (è possibile aggiungere un secondo parametro e restituirle in base ad entrambi, il secondo parametro può essere ad esempio l email del creatore)
// app.get("/playlist/tutteLePlaylist/:nome/:parametro?", async function (req, res)  {

// fare che se non metto nessun nome restituisce tutte le playlist
app.get("/playlist/:nome?", async function (req, res) {
    let nomePlaylist = req.params.nome
    console.log(nomePlaylist)
    let pwmClient = await new mongoClient(uri).connect()
    try {
        // faccio la project perche non serve restituire l id della playlist, e restituisco solo le playlist pubbliche
        let playlist = await pwmClient.db("spotifai").collection('playlist').find({ nomePlaylist: nomePlaylist, pubblica:true }).project({ _id: 0 }).toArray()
        console.log(playlist)
        res.send(playlist)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})





// inserisco il nome della playlist nel db con utenti e playlist
app.post("/playlist/playlistUtente", async function (req, res) {
    console.log("post per inserire una nuova playlist nelle playlist di un utente")

    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email")
        return
    }
    if (!req.body.nomePlaylist) {
        res.status(400).send("Manca il nome della playlist")
        return
    }

    let pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('playlist').findOne({ emailUtente: req.body.emailUtente, nomePlaylist: req.body.nomePlaylist })
        if (presente) {
            res.status(400).send("il record è già presente")  //devo restituire un errore se è già presente? credo di si
        } else {
            var items = await pwmClient.db(db).collection('playlist').insertOne(req.body)
            res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };

});


// metto una canzone in una playlist di un determinato utente
app.post("/playlist", auth, async function (req, res) {

    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email dell utente")
        return
    }
    if (!req.body.idCanzone) {
        res.status(400).send("Manca l id della canzone")
        return
    }
    if (!req.body.nomePlaylist) {
        res.status(400).send("Manca il nome della playlist")
        return
    }


    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('canzoniPlaylist').findOne({ emailUtente: req.body.emailUtente, idCanzone: req.body.idCanzone, nomePlaylist: req.body.nomePlaylist })
        if (presente) {
            res.status(400).send("il record è già presente")  //devo restituire un errore se è già presente? credo di si
        } else {
            var items = await pwmClient.db(db).collection('canzoniPlaylist').insertOne(req.body)
            res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})



// data l email dell utente, l id della canzone e il nome della playlist, cancella dal db dei brani in playlist 
// quella canzone
app.delete("/playlist/cancellaCanzoneSingola/:emailUtente/:idCanzone/:nomePlaylist", async function (req, res) {
    // console.log(req.params)
    var pwmClient = await new mongoClient(uri).connect()

    try {
        let risultato = await pwmClient
            .db("spotifai")
            .collection('canzoniPlaylist')
            .deleteOne({ emailUtente: req.params.emailUtente, idCanzone: req.params.idCanzone, nomePlaylist: req.params.nomePlaylist });
        console.log(risultato)
        if (risultato.acknowledged) {
            res.json(risultato)
        } else {
            res.status(400).send("il record non era presente all interno del db")
        }
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    }
})


// data l email dell utente e il nome della playlist, cancella tutte le canzoni dalla playlist
app.delete("/playlist/cancellaCanzoni/:emailUtente/:nomePlaylist", async function (req, res) {
    console.log("entro")
    console.log("sono in cancella canzoni della playlist ", req.params)
    var pwmClient = await new mongoClient(uri).connect()

    try {
        let risultato = await pwmClient
            .db("spotifai")
            .collection('canzoniPlaylist')
            .deleteMany({ emailUtente: req.params.emailUtente, nomePlaylist: req.params.nomePlaylist });
        console.log(risultato)
        if (risultato.acknowledged) {
            res.json(risultato)
        } else {
            res.status(400).send("il record non era presente all interno del db")
        }
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    }
})


// cancella la playlist dall elenco delle playlist ( ATTENZIONE, l elenco delle canzoni delle playlist rimane)
// per cancellare completamente una playlist chiamare quest api e quella precedente
//  o fare in modo che questa chiami la precedente
app.delete("/playlist/cancellaPlaylist/:emailUtente/:nomePlaylist", async function (req, res) {
    console.log(req.params)
    var pwmClient = await new mongoClient(uri).connect()

    try {
        let risultato = await pwmClient
            .db("spotifai")
            .collection('playlist')
            .deleteOne({ emailUtente: req.params.emailUtente, nomePlaylist: req.params.nomePlaylist });
        console.log(risultato)
        if (risultato.acknowledged) {
            res.json(risultato)
        } else {
            res.status(400).send("il record non era presente all interno del db")
        }
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    }
})


// SEGUIRE LE PLAYLIST
// sarebbe da aggiungere, che se un utente cancella una sua playlist la cancella anche dalla collezione playlist seguite

// inserisce una playlist di un autore, tra le playlist seguite dall utente
app.post("/playlist/playlistSeguite", auth, async function (req, res) {
    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email")
        return
    }
    if (!req.body.nomePlaylist) {
        res.status(400).send("Manca il nomePlaylist")
        return
    }
    if (!req.body.emailAutorePlaylist) {
        res.status(400).send("Manca il emailAutorePlaylist")
        return
    }
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('playlistSeguite').findOne({ emailUtente: req.body.emailUtente, nomePlaylist: req.body.nomePlaylist, emailAutorePlaylist: req.body.emailAutorePlaylist })
        if (presente) {
            res.status(400).send("il record è già presente")
        } else {
            var items = await pwmClient.db(db).collection('playlistSeguite').insertOne(req.body)
            res.json(items)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})

//  dice se un utente segue una certa playlist
app.get("/playlist/playlistSeguita/:emailUtente/:nomePlaylist/:emailAutorePlaylist", async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('playlistSeguite').findOne({ emailUtente: req.params.emailUtente, nomePlaylist: req.params.nomePlaylist, emailAutorePlaylist: req.params.emailAutorePlaylist })
        if (presente) {
            res.send(presente)
        } else {
            res.send(false)
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})


//  cancella unna playlist tra le seguite di un certo utente
app.delete("/playlist/playlistSeguita/:emailUtente/:nomePlaylist/:emailAutorePlaylist", async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    try {
        let risultato = await pwmClient
            .db("spotifai")
            .collection('playlistSeguite')
            .deleteOne({ emailUtente: req.params.emailUtente, nomePlaylist: req.params.nomePlaylist, emailAutorePlaylist: req.params.emailAutorePlaylist });
        console.log(risultato)
        if (risultato.acknowledged) {
            res.json(risultato)
        } else {
            res.status(400).send("il record non era presente all interno del db")
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
})


// restituisce tutte le playlist seguite da un determinato utente  // se faccio "/playlist/playlistSeguiteDallUtente/:emailUtente" non va
app.get("/playlistSeguiteDallUtente/:emailUtente", async function (req, res) {
    let emailUtente = req.params.emailUtente
    let pwmClient = await new mongoClient(uri).connect()
    try {
        // faccio la project perche restituisco solo l il nome della playlist, non anche la email utente
        let playlist = await pwmClient.db("spotifai").collection('playlistSeguite').find({ emailUtente: emailUtente}).project({ emailUtente: 0, _id: 0 }).toArray()
        
        console.log(playlist)
        let playlistPubbliche = [];
        // per ogni playlist seguita vedo se è pubblica
        // se seguo la playlist e dopo il proprietario la mette privata, la seguirò comunque ma non potrò vederla
        // non la cancello dalle playlist seguite perche se poi torna pubblica la riavrò ancora tra le mie playlist
        for (let i = 0; i < playlist.length; i++) {
            let tmp = await pwmClient.db("spotifai").collection('playlist')
                .find({ emailUtente: playlist[i].emailAutorePlaylist, nomePlaylist: playlist[i].nomePlaylist, pubblica:true})
                .project({ pubblica: 0, _id: 0 }).toArray()
            playlistPubbliche = playlistPubbliche.concat(tmp)
        }
        console.log("tutte", playlist)
        console.log("pubbliche", playlistPubbliche)
        // res.send(playlist)
        res.send(playlistPubbliche)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
});


// PLAYLIST PUBBLICA O PRIVATA


//IN TUTTO QUESTO FILE (DA RIGA 0 A L ULTIMA) METTERE CHE LE DELETE E PUT NON RICEVONO I PARAMETRI DALL URL



// rende la playlist di un certo utente privata
app.put("/playlist/rendiPrivata", async function (req, res) {
    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email")
        return
    }
    if (!req.body.nomePlaylist) {
        res.status(400).send("Manca il nomePlaylist")
        return
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { emailUtente: req.body.emailUtente, nomePlaylist: req.body.nomePlaylist  }
        let updatePlaylist = {
            $set: {pubblica:false}
        }
        var item = await pwmClient.db("spotifai")
            .collection('playlist')
            .updateOne(filter, updatePlaylist)
        res.send(item)
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)

    };
})

// rende la playlist di un certo utente pubblica    (è identica alla funzione sopra ma il filter è impostato a true)
// si potrebbe fare una sola put che riceve come parametro true o false 
app.put("/playlist/rendiPubblica", async function (req, res) {
    if (!req.body.emailUtente) {
        res.status(400).send("Manca l' email")
        return
    }
    if (!req.body.nomePlaylist) {
        res.status(400).send("Manca il nomePlaylist")
        return
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { emailUtente: req.body.emailUtente, nomePlaylist: req.body.nomePlaylist  }
        let updatePlaylist = {
            $set: {pubblica:true}
        }
        var item = await pwmClient.db("spotifai")
            .collection('playlist')
            .updateOne(filter, updatePlaylist)
        res.send(item)
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)

    };
})




// UTENTE


// cancella un utente dal db, dovrò cancellare anche le playlist e artisti preferiti
app.delete("/users/cancellaUtente/:emailUtente/:password", async function (req, res) {


})

// aggiorna l username dell utente se la password è corretta
app.post("/users/aggiornaUsername", auth, async function (req, res) {


    console.log("sto modificando l username dell utente")

    if (!req.body.username) {
        res.status(400).send("Manca l' username dell utente")
        return
    }
    if (!req.body.email) {
        res.status(400).send("Manca l id della canzone")
        return
    }
    if (!req.body.password) {
        res.status(400).send("Manca il nome della playlist")
        return
    }


    req.body.password = hash(req.body.password)
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var presente = await pwmClient.db("spotifai").collection('utenti').findOne({ email: req.body.email, password: req.body.password })
        if (presente) {
            var items = await pwmClient.db(db).collection('utenti')
                .updateOne({ email: req.body.email, password: req.body.password }, { $set: { username: req.body.username } })
            res.json(items)
        } else {
            // qua sto dando per scontato che l email che mi arriva sia sempre corretta, dovrei controllare anche
            // quella e fare due casi separati  
            res.status(400).send("la password inserita non è corretta")
        }
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };

})



app.listen(3000, "0.0.0.0", () => {
    console.log("Server partito porta 3000")
})
