// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import mapboxgl from 'mapbox-gl';
import update from '../helpers/update';
import config from '../config';

// Import the template to use
const kotenTemplate = require('../templates/koten.handlebars');
const { getInstance } = require('../firebase/firebase');


const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const Pagename = 'Signin page';
  // Return the compiled template to the router
  update(compile(kotenTemplate, getInstance)({ Pagename }));
  console.log('Log: Koten');
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        localStorage.setItem('userLat', snapshot.val().lat);
        localStorage.setItem('userLong', snapshot.val().long);
        if (snapshot.val().adminID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/adminhome">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/create">Create</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        } else if (snapshot.val().userID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/favorite">Favorieten</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        }
        if (document.getElementById('openMenu') !== null) {
          document.getElementById('openMenu').addEventListener('click', () => {
            document.getElementById('myNav').style.width = '50%';
          });
        }
        if (document.getElementById('closeMenu') !== null) {
          document.getElementById('closeMenu').addEventListener('click', () => {
            document.getElementById('myNav').style.width = '0%';
          });
        }
        const logout = () => {
          firebase.auth().signOut();
          localStorage.removeItem('currentAdmin');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userLong');
          localStorage.removeItem('userLat');
          localStorage.removeItem('type');
        };
        if (document.getElementById('logout') !== null) {
          document.getElementById('logout').addEventListener('click', logout);
        }
      });
      const degreesToRadians = (degrees) => {
        return degrees * (Math.PI / 180);
      }
      const kotenRef = firebase.database().ref('Koten');
      kotenRef.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          const currentKot = firebase.database().ref('Koten/' + childSnapshot.key);
          const Lat = localStorage.getItem('userLat');
          const Long = localStorage.getItem('userLong');
          const Long2 = childSnapshot.val().kotLong;
          const Lat2 = childSnapshot.val().kotLat;
          const R = 6371; // metres
          const φ1 = degreesToRadians(Lat);
          const φ2 = degreesToRadians(Lat2);
          const Δφ = degreesToRadians(Lat2 - Lat);
          const Δλ = degreesToRadians(Long2 - Long);
          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
              + Math.cos(φ1) * Math.cos(φ2)
              * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const result = Math.round(R * c);
          currentKot.child('toUser').set(result);
        });
      });
    }
  });
  const koten = JSON.parse(localStorage.getItem('koten'));
  if (koten[0] === undefined) {
    document.getElementById('kotList').innerHTML += `<h1>Sorry! Er zijn momenteel geen nieuwe koten beschikbaar</h1><br>
    <p>U hebt door alle huidige koten gecycled u kan naar de <a href="/#/kotenlijst">kotenlijst</a> gaan voor de algemene koten te bekijken</p>`;
  }
  document.getElementById('kotList').innerHTML += `<img class="tinderImage" src="${koten[0].image}"><br>`;
  document.getElementById('kotList').innerHTML += `<h2>Adres: ${koten[0].adres}<br></h2>`;
  document.getElementById('kotList').innerHTML += `<p>Huurprijs: €${koten[0].huurprijs} / maand<br></p>`;
  document.getElementById('kotList').innerHTML += `<p>${koten[0].user}<br></p>`;
  document.getElementById('kotList').innerHTML += '<button id="detailKnop">Details</button><button id="contactKnop">Contact</button>';
  document.getElementById('kotList').innerHTML += '<div id="tinderButtons" ><button id="favoKnop"></button><button id="nextKnop"></button></div>';

  // DETAIL POP UP
  document.getElementById('detailKnop').addEventListener('click', () => {
    document.getElementById('openMenu').style.display = 'none';
    document.getElementById('kotDetail').style.display = 'block';
    document.getElementById('kotList').style.display = 'none';
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').innerHTML += '<button id="detailClose">close</button><br>';
    document.getElementById('info').innerHTML += `<img class="tinderDetailImage" src="${koten[0].image}"><br>`;
    document.getElementById('info').innerHTML += `Adres: ${koten[0].adres}<br>`;
    document.getElementById('info').innerHTML += `Huurprijs: ${koten[0].huurprijs} / maand<br>`;
    document.getElementById('info').innerHTML += `Oppervlakte: ${koten[0].oppervlakte}m&sup2;<br>`;
    document.getElementById('info').innerHTML += `Personen: ${koten[0].personen}<br>`;
    document.getElementById('info').innerHTML += `Type: ${koten[0].type}<br>`;
    document.getElementById('info').innerHTML += `Keuken: ${koten[0].keuken}<br>`;
    document.getElementById('info').innerHTML += `Douche: ${koten[0].douche}<br>`;
    document.getElementById('info').innerHTML += `Bemeubeld: ${koten[0].bemeubeld}<br>`;
    document.getElementById('info').innerHTML += `BemeubeldUitleg: ${koten[0].bemeubeldUitleg}<br>`;
    document.getElementById('info').innerHTML += `Kotbaas: ${koten[0].user}<br><br><br>`;
    document.getElementById('info').innerHTML += '<div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="large" data-mobile-iframe="true"><a id="shareKnop" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Delen</a></div>';
    // POPUP CLOSE
    document.getElementById('detailClose').addEventListener('click', () => {
      document.getElementById('kotDetail').style.display = 'none';
      document.getElementById('kotList').style.display = 'block';
      document.getElementById('openMenu').style.display = 'block';
    });
  });
  document.getElementById('contactKnop').addEventListener('click', () => {
    document.getElementById('kotDetail').style.display = 'block';
    document.getElementById('kotList').style.display = 'none';
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').innerHTML += '<button id="Close">&times;</button><br>';
    document.getElementById('info').innerHTML += '<form><h1>Contact</h1><textarea id="message" placeholder="Geef uw boodschap hierin"></textarea><input type="submit" id="sendMessage" value="Send"></form>';
    // POPUP CLOSE
    document.getElementById('Close').addEventListener('click', () => {
      document.getElementById('kotDetail').style.display = 'none';
      document.getElementById('kotList').style.display = 'block';
    });
    document.getElementById('sendMessage').addEventListener('click', (e) => {
      e.preventDefault();
      const ref = firebase.database().ref('Messages');
      const message = document.getElementById('message').value;
      const kot = koten[0].adres;
      const creator = koten[0].user;
      const sender = firebase.auth().currentUser.email;
      const senderId = firebase.auth().currentUser.uid;
      const recepient = koten[0].adminUid;
      const reply = '';
      const Data = {
        message,
        kot,
        sender,
        senderId,
        recepient,
        creator,
        reply,
        date: new Date().getTime(),
      };
      ref.push(Data);
      document.getElementById('kotDetail').style.display = 'none';
      document.getElementById('kotList').style.display = 'block';
    });
  });
  // skip
  document.getElementById('nextKnop').addEventListener('click', () => {
    koten.shift();
    localStorage.setItem('koten', JSON.stringify(koten));
    window.location.reload();
  });
  // favorite
  document.getElementById('favoKnop').addEventListener('click', () => {
    const currentUser = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref('Favorieten');
    const image = koten[0].image;
    const adres = koten[0].adres;
    const user = koten[0].user;
    const huurprijs = koten[0].huurprijs;
    const waarborg = koten[0].waarborg;
    const type = koten[0].type;
    const oppervlakte = koten[0].oppervlakte;
    const verdieping = koten[0].verdieping;
    const personen = koten[0].personen;
    const toilet = koten[0].toilet;
    const douche = koten[0].douche;
    const keuken = koten[0].keuken;
    const bemeubeld = koten[0].bemeubeld;
    const bemeubeldUitleg = koten[0].bemeubeldUitleg;
    const entiteiten = koten[0].entiteiten;
    const opmerking = koten[0].opmerking;
    const afstand = koten[0].toUser;
    const data = {
      currentUser,
      image,
      huurprijs,
      waarborg,
      type,
      oppervlakte,
      verdieping,
      personen,
      toilet,
      douche,
      keuken,
      bemeubeld,
      bemeubeldUitleg,
      adres,
      entiteiten,
      opmerking,
      kotbaas: user,
      afstand,
    };
    ref.push(data);
    koten.shift();
    localStorage.setItem('koten', JSON.stringify(koten));
    window.location.reload();
  });
  if (config.mapBoxToken) {
    // eslint-disable-next-line no-unused-vars
    mapboxgl.accessToken = config.mapBoxToken;
    const tinderMap = new mapboxgl.Map({
      container: 'tinderMap',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [koten[0].kotLat, koten[0].kotLong],
      zoom: 15,
    });
    tinderMap.on('load', () => {
      new mapboxgl.Marker()
        .setLngLat([koten[0].kotLat, koten[0].kotLong])
        .addTo(tinderMap);
    });
    // Mapbox Markers
  }
};
