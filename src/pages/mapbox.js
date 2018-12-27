// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import mapboxgl from 'mapbox-gl';
import config from '../config';

// Import the update helper
import update from '../helpers/update';

const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

// Import the template to use
const mapTemplate = require('../templates/mapbox.handlebars');

export default () => {
  // Data to be passed to the template
  const title = 'Mapbox example';
  update(compile(mapTemplate)({ title }));
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
          document.getElementById('menu').innerHTML += '<li><a href="/?#/koten">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/favorite">Favorieten</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/messages">Messages</a></li>';
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
  const pointers = [];
  const ref = firebase.database().ref('Koten');
  ref.on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const kot = childSnapshot.val();
      const pointer = {
        Longitude: kot.kotLong,
        Latitude: kot.kotLat,
        Image: kot.image,
        Adres: kot.adres,
        Prijs: kot.huurprijs,
      };
      pointers.push(pointer);
    });
  });
  if (config.mapBoxToken) {
    // eslint-disable-next-line no-unused-vars
    mapboxgl.accessToken = config.mapBoxToken;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [3.725, 51.05389],
      zoom: 12,
    });
    map.on('load', () => {
      pointers.forEach((pointer) => {
        new mapboxgl.Marker()
          .setLngLat([pointer.Latitude, pointer.Longitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<img class="pointerImage" src="${pointer.Image}"></img><p>${pointer.Adres}</p><p>Huurprijs: €${pointer.Prijs}</p>`))
          .addTo(map);
      });
    });
    // Mapbox Markers
  }
};
