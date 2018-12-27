// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
// Import the template to use
const kotenTemplate = require('../templates/koten.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const Pagename = 'Signin page';
  // Return the compiled template to the router
  update(compile(kotenTemplate, getInstance)({ Pagename }));
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        console.log(snapshot.val());
        if (snapshot.val().adminID === true) {
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/adminhome">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/messages">Messages</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/create">Create</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/kotenlijst">Kotenlijst</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="#" id="logout">Logout</a></li>';
        } else {
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/favorite">Favorieten</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/messages">Messages</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/kotenlijst">Kotenlijst</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/mapbox">Mapbox</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="#" id="logout">Logout</a></li>';
        }
        const logout = () => {
          firebase.auth().signOut();
          localStorage.removeItem('currentAdmin');
          localStorage.removeItem('currentUser');
        };
        document.getElementById('logout').addEventListener('click', logout);
      });
    }
  });
  const koten = JSON.parse(localStorage.getItem('koten'));
  document.getElementById('kotList').innerHTML += `<img class="tinderImage" src="${koten[0].image}"><br>`;
  document.getElementById('kotList').innerHTML += `adres: ${koten[0].adres}<br>`;
  document.getElementById('kotList').innerHTML += `kotbaas: ${koten[0].user}<br>`;
  document.getElementById('kotList').innerHTML += '<div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="large" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Delen</a></div><button id="detailKnop">Details</button><button id="contactKnop">Contact</button><button id="favoKnop">Favorite</button><button id="nextKnop">Skip</button>';
  // DETAIL POP UP
  document.getElementById('detailKnop').addEventListener('click', () => {
    document.getElementById('kotDetail').style.display = 'block';
    document.getElementById('kotList').style.display = 'none';
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').innerHTML += '<button id="detailClose">close</button><br>';
    document.getElementById('info').innerHTML += `<img class="tinderDetailImage" src="${koten[0].image}"><br>`;
    document.getElementById('info').innerHTML += `adres: ${koten[0].adres}<br>`;
    document.getElementById('info').innerHTML += `huurprijs: ${koten[0].huurprijs}<br>`;
    document.getElementById('info').innerHTML += `oppervlakte: ${koten[0].oppervlakte}<br>`;
    document.getElementById('info').innerHTML += `personen: ${koten[0].personen}<br>`;
    document.getElementById('info').innerHTML += `type: ${koten[0].type}<br>`;
    document.getElementById('info').innerHTML += `keuken: ${koten[0].keuken}<br>`;
    document.getElementById('info').innerHTML += `douche: ${koten[0].douche}<br>`;
    document.getElementById('info').innerHTML += `bemeubeld: ${koten[0].bemeubeld}<br>`;
    document.getElementById('info').innerHTML += `bemeubeldUitleg: ${koten[0].bemeubeldUitleg}<br>`;
    document.getElementById('info').innerHTML += `kotbaas: ${koten[0].user}<br>`;
    // POPUP CLOSE
    document.getElementById('detailClose').addEventListener('click', () => {
      document.getElementById('kotDetail').style.display = 'none';
      document.getElementById('kotList').style.display = 'block';
    });
  });
  document.getElementById('contactKnop').addEventListener('click', () => {
    document.getElementById('kotDetail').style.display = 'block';
    document.getElementById('kotList').style.display = 'none';
    document.getElementById('info').innerHTML = '';
    document.getElementById('info').innerHTML += '<button id="Close">close</button><br>';
    document.getElementById('info').innerHTML += '<h1>Contact</h1><form><textarea id="message" placeholder="Geef uw boodschap hierin"></textarea><input type="submit" id="sendMessage" value="Send"></form>';
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
    };
    ref.push(data);
    koten.shift();
    localStorage.setItem('koten', JSON.stringify(koten));
    window.location.reload();
  });
};
