// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const favoriteTemplate = require('../templates/favorite.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();


export default () => {
  // Data to be passed to the template
  const name = 'Test inc.';
  update(compile(favoriteTemplate)({ name }));
  console.log('Log: Favorite');

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        if (snapshot.val().adminID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/adminhome">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/create">Create</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        } else if (snapshot.val().userID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/koten">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a></li>';
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
    }
  });
  const ref = firebase.database().ref('Favorieten');
  ref.on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const fav = childSnapshot.val();
      if (firebase.auth().currentUser.uid === fav.currentUser) {
        document.getElementById('myList').innerHTML += `<img id="favoImg" src=${fav.image}></img><br>`;
        document.getElementById('myList').innerHTML += `Adres ${fav.adres}<br>`;
        document.getElementById('myList').innerHTML += `Type: ${fav.type}<br>`;
        document.getElementById('myList').innerHTML += `Oppervlakte: ${fav.oppervlakte}<br>`;
        document.getElementById('myList').innerHTML += `Huurprijs: ${fav.huurprijs}<br>`;
        document.getElementById('myList').innerHTML += `Waarborg: ${fav.waarborg}<br>`;
        document.getElementById('myList').innerHTML += `Verdieping: ${fav.verdieping}<br>`;
        document.getElementById('myList').innerHTML += `Aantal personen: ${fav.personen}<br>`;
        document.getElementById('myList').innerHTML += `Keuken: ${fav.keuken}<br>`;
        document.getElementById('myList').innerHTML += `Douche: ${fav.douche}<br>`;
        document.getElementById('myList').innerHTML += `Toilet: ${fav.toilet}<br>`;
        document.getElementById('myList').innerHTML += `Bemeubeld: ${fav.bemeubeld}<br>`;
        document.getElementById('myList').innerHTML += `Uitleg: ${fav.bemeubeldUitleg}<br>`;
        document.getElementById('myList').innerHTML += `Kotbaas: ${fav.kotbaas}<br>`;
      }
    });
  });
};
