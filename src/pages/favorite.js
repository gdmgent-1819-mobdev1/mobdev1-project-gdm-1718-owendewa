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
  const remove = (e) => {
    e.preventDefault();
    const selectedFavorite = e.currentTarget.id;
    const favoriteRef = firebase.database().ref(`Favorieten/${selectedFavorite}`);
    favoriteRef.remove();
    document.querySelector('#myList').innerHTML = '';
    window.location.reload();
  };
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
        document.getElementById('myList').innerHTML += `
        <div id="favoriteBox">
          <a href="#" id="${childSnapshot.key}" class="favoriteRemove">Remove</a>
          <h1>${fav.type}</h1>
          <p>${fav.adres}</p>
          <img id="favoImg" src=${fav.image}></img><br>
          <h2>Algemene Info</h2>
          <p>€${fav.huurprijs} / maand</p>
          <p>${fav.oppervlakte}m&sup2;</p>
          <p>€${fav.waarborg}/ waarborg</p>
          <p>Verdieping: ${fav.verdieping}</p>
          <p>Aantal personen: ${fav.personen}</p>
          <h2>Sanitaire Info</h2>
          <p>Keuken: ${fav.keuken}</p>
          <p>Douche: ${fav.douche}</p>
          <p>Toilet: ${fav.toilet}</p>
          <h2>Extra Info</h2>
          <p>Bemeubeld: ${fav.bemeubeld}</p>
          <p>Uitleg: ${fav.bemeubeldUitleg}</p>
          <p>Kotbaas: ${fav.kotbaas}</p>
        </div>`;
        const favoriteButtons = document.querySelectorAll('.favoriteRemove');
        for (let i = 0; i < favoriteButtons.length; i++) {
          favoriteButtons[i].addEventListener('click', remove);
        }
      }
    });
  });
};
