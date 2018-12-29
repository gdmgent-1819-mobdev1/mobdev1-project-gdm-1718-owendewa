// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
import config from '../config';

// Import the template to use
const createTemplate = require('../templates/create.handlebars');
const kotenTemplate = require('../templates/koten.handlebars');

const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  const database = firebase.database();
  const kotRef = database.ref('Koten');
  // Data to be passed to the template
  const Pagename = 'Create Page.';
  // Return the compiled template to the router
  update(compile(createTemplate, kotenTemplate)({ Pagename }));
  console.log('Log: Create');

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
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a></li>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        } else if (snapshot.val().userID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/koten">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/favorite">Favorieten</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a>';
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
  // Put in firebase
  let koten_array = [];
  let imagePath;
  let imgURL;
  const image = document.getElementById('image');
  image.addEventListener('change', (evt) => {
    if (image.value !== '') {
      const filename = evt.target.files[0].name.replace(/\s+/g, '-').toLowerCase();
      const storageRef = firebase.storage().ref(`images/${filename}`);

      storageRef.put(evt.target.files[0]).then(() => {
        imagePath = `images/${filename}`;

        const storeimage = firebase.storage().ref(imagePath);
        storeimage.getDownloadURL().then((url) => {
          imgURL = url;
        });
      });
    }
  });
  document.getElementById('createSubmit').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('test');
    if (firebase) {
      console.log('test2');
      const adres = document.getElementById('adres').value;
      const URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${adres}.json?access_token=${config.mapBoxToken}&cachebuster=1545701868024&autocomplete=true&limit=1`;
      if (config.mapBoxToken) {
        fetch(URL, {
          method: 'GET',
        })
          .then(response => response.json())
          .then((data) => {
            console.log(URL);
            const kotLat = JSON.stringify(data.features[0].center[0]);
            const kotLong = JSON.stringify(data.features[0].center[1]);
            const huurprijs = document.getElementById('huurprijs').value;
            const waarborg = document.getElementById('waarborg').value;
            const type = document.getElementById('type').value;
            const oppervlakte = document.getElementById('oppervlakte').value;
            const verdieping = document.getElementById('verdieping').value;
            const personen = document.getElementById('personen').value;
            const toilet = document.getElementById('toilet').value;
            const douche = document.getElementById('douche').value;
            const keuken = document.getElementById('keuken').value;
            const bemeubeld = document.getElementById('bemeubeld').value;
            const bemeubeldUitleg = document.getElementById('bemeubeldUitleg').value;
            const entiteiten = document.getElementById('entiteiten').value;
            const opmerking = document.getElementById('opmerking').value;
            const user = localStorage.getItem('currentAdmin');
            const adminUid = firebase.auth().currentUser.uid;
            console.log(data);
            const kotData = {
              image: imgURL,
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
              user,
              adminUid,
              kotLat,
              kotLong,
            };
            kotRef.push(kotData);
            console.log(kotData.huurprijs);
            if (localStorage.getItem('koten') !== null) {
              koten_array = JSON.parse(localStorage.getItem('koten'));
              koten_array.push(kotData);
              koten_array = localStorage.setItem('koten', JSON.stringify(koten_array));
            } else {
              koten_array.push(kotData);
              koten_array = localStorage.setItem('koten', JSON.stringify(koten_array));
            }
            window.location.replace('/#/kotenlijst');
            window.location.reload();
          });
      }
    }
  });
};
