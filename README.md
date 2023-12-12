# Web
Progetto per esame programmazione web

![Mappa sito](https://github.com/dellematti/Web/blob/main/Screenshot.png)

Spotifai è un applicazione web clone di Spotify. L’ applicazione si occupa della gestione delle playlist di
canzoni. Deve essere possibile per ogni utente creare playlist e poterle successivamente
modificare e cancellare.
Lo scopo è quello di poter interagire, oltre che con le proprie, anche con le playlist degli altri utenti visualizzandole e seguendole,
questo solo nel caso esse siano pubbliche (ogni utente ha la possibilità di rendere le sue playlist pubbliche o
private).

Se una playlist pubblica con dei follower diventa privata, ho deciso di non cancellare i follower ma
solamente di non rendere la playlist visibile ad essi. Questo perché in caso la playlist torni pubblica i
follower potranno ricominciare a vederla.
Inoltre i follower che seguono una playlist, non hanno a loro disposizione una copia della playlist da
modificare, ma solamente un riferimento ad essa, la playlist rimane appartenente solo all autore che resta
l’ unico utente in grado di modificarla ( le modifiche sono poi viste da tutti i follower).
Nella homepage sono presenti gli album usciti recentemente (divisi tra i più in tendenza a livello globale, e i
più in tendenza esclusivamente in Italia).

Dall' homepage si può accedere ad altre pagine in cui si può:
- vedere tutte le playlist pubbliche dei vari utenti dell applicazione
- aprire la pagina di informazioni di un album tra quelli in tendenza
- vedere i propri artisti preferiti (solo se si è loggati)
- vedere le proprie playlist e quelle seguite (solo se si è loggati)
- gestire l’ account utente (solo se si è loggati)
- effettuare il login e la registrazione ( solo se non si è loggati)
- effettuare una ricerca di canzoni, artisti, album e playlist pubbliche

Funzioni del sito:
Oltre alle playlist personalizzate, ogni utente quando si trova sulla pagina di un artista può scegliere se
aggiungerlo ai suoi artisti preferiti (o rimuoverlo). Questa scelta non è visibile agli altri utenti.
Si può poi controllare tutti gli artisti preferiti tramite la apposita pagina. Inoltre nell’ homepage
viene ogni volta generato casualmente un artista consigliato. Questo è possibile utilizzando l’api di spotify
che dato un artista ne restituisce alcuni consigliati.
Scegliere ogni volta un artista casuale tra la lista dei preferiti dell’ utente e usarlo per ottenerne un altro casuale tra la lista dei consigliati generati da spotify, rende possibile avere un vasto numero di artisti consigliati per
utente da cui scegliere.
La funzione di ricerca offerto nel sito (accessibile dalla navbar in ogni momento) offre la possibilità di cercare non
solo le canzoni, ma anche artisti, album e playlist pubbliche di altri utenti.


![Mappa sito](https://github.com/dellematti/Web/blob/main/Mappa%20sito.png)


In rosso sono indicate le pagine a cui si può accedere solo se l utente è loggato, in blu quelle accessibili a
chiunque (in azzurro invece le pagine invece dove è possibile accedere solo se non si è loggati).
La homepage è sempre raggiungibile dalla navbar superiore, da cui si può inoltre fare ricerche e gestire l
utente ( o effettuare il login). Nella navbar laterale è possibile accedere alla lista di artisti preferiti e playlist
dell utente. In caso l utente non sia loggato verremo rimandati alla pagina di login.
In seguito ad una ricerca è chiaramente possibile accedere a le pagine contenti le informazioni dei risultati
(artisti, album e anche playlist se ne è presenta una con il nome identico alla ricerca).





E’ sempre possibile aprire la pagina relativa ad un certo album per visualizzare le informazioni e le canzoni,
e poterle aggiungere ad una playlist. Stessa cosa per le pagine relative agli artisti, dove inoltre si può
aggiungere l' artista ai preferiti dell utente.
In generale da ogni pagina contenente delle canzoni, (come pagine di playlist, album artisti e risultati della
ricerca) ho la possibilità di aggiungere la canzone ad una playlist dell'utente.

Il progetto è diviso in front-end e back-end, il front-end è sviluppato con HTML CSS e Javascript mentre il
backend in Javascript utilizzando NodeJs ed Express.
Il database è MongoDB, database di tipo NoSQL. Nel database ho diverse collezioni: ho usato due collezioni
per le playlist, una per rappresentare la playlist e il proprietario ( e il fatto che sia pubblica o privata) e una
collezione per le playlist seguite, dove ho per ogni document il nome della playlist, il creatore e la persona
che la segue.
Per ogni playlist (identificata quindi dal nome e dal creatore) ho l id delle canzoni presenti al suo interno. Se
volessi diminuire il numero di richieste a Spotify potrei salvare altre informazioni oltre all id, come il nome
della canzone, l autore, etc...
Sono presenti altre collezioni contenenti le varie informazioni su ogni utente e collezioni per la gestione degli
artisti preferiti di ogni utente.

Le informazioni che consentono di sapere se l’ utente è loggato ( e l'email dell’ utente loggato) sono salvate nel
local storage.

Il mio front-end comunica direttamente con le api di Spotify. Nel contesto dell’ esame non serve ma se
dovessi mettere il sito online, sarebbe preferibile avere la comunicazione con Spotify fatta esclusivamente
dal mio backend. Questo a causa del codice client di Spotify, che in caso di comunicazione diretta tra il front
end e Spotify rimane pubblico.
Simile problema relativo alla sicurezza che può creare inconvenienti mettendo il sito online è il fatto che il
back-end si basa ciecamente su ciò che arriva dal front-end: ad esempio per aggiungere una canzone ad
una playlist, all’ api basta un indirizzo email e id di playlist e canzone. Basterebbe semplicemente modificare l
indirizzo email nel front-end con ispeziona pagina per inserire canzoni nelle playlist degli altri utenti o fare
altre operazioni indesiderate anche peggiori.

Per la parte di css ho utilizzato un mio file css e una versione che ho modificato di un template (per alcune
parti specifiche come il preloader e alcune classi di utilità).

Nel backend vengono offerte api per poter interagire con le playlist, ad esempio:
- aggiungere canzoni
- rimuovere canzoni
- sapere quali canzoni fanno parte della playlist
- seguire una playlist
- smettere di seguire una playlist
- ottenre informazioni sulle playlist di un utente.
- Cancellare una playlist
- Renderla pubblica
- Renderla privata

Sono poi disponibili api simili per gestire gli artisti preferiti di un utente che rendono possibile:
- Aggiungere artisti
- Rimuovere artisti
- Sapere se un artista è tra i preferiti di un utente
- Sapere tutti gli artisti preferiti dell’utente

E sono offerte api per la gestione dell’account utente:
- Registrare un utente
- Cancellare un utente
- Effettuare il login
- Sapere l username dell utente data l’ email
- Cambiare username
- Cambiare password

Per la documentazione è disponibile uno swagger raggiungibile tramite http://localhost:3000/api-docs/.
