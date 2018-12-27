
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
import config from '../config';

// Import the template to use
const kotenLijstTemplate = require('../templates/kotenlijst.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();
export default () => {
  const database = firebase.database();
  // Data to be passed to the template
  const Pagename = 'Signin page';
  // Return the compiled template to the router
  update(compile(kotenLijstTemplate, getInstance)({ Pagename }));
  const filter = document.getElementById('filterBox');
  let kotRef;
  filter.addEventListener('change', () => {
    if (filter.value === '1') {
      kotRef = database.ref('Koten');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '2') {
      kotRef = database.ref('Koten').orderByChild('huurprijs');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '3') {
      kotRef = database.ref('Koten').orderByChild('oppervlakte');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '4') {
      kotRef = database.ref('Koten').orderByChild('type');
      document.querySelector('#createdKotList').innerHTML = '';
    }
    let selectedKot;
    let image;
    let imagePath;
    let imgURL;
    let noImgUrl;
    const remove = (e) => {
      selectedKot = e.currentTarget.id;
      const ref = database.ref(`Koten/${selectedKot}`);
      ref.remove();
      document.querySelector('#createdKotList').innerHTML = '';
      window.location.replace('/adminhome');
      alert(`deleted kot ${selectedKot}`);
    };
    const edit = (e) => {
      filter.style.display = 'none';
      document.getElementById('menu').style.display = 'none';
      const picture = document.getElementById('image');
      picture.addEventListener('change', (evt) => {
        if (picture !== '') {
          const filename = evt.target.files[0].name.replace(/\s+/g, '-').toLowerCase();
          const storageRef = firebase.storage().ref(`images/${filename}`);
          storageRef.put(evt.target.files[0]).then(() => {
            imagePath = `images/${filename}`;
            const storeimage = firebase.storage().ref(imagePath);
            storeimage.getDownloadURL().then((url) => {
              imgURL = url;
              if (imgURL !== '') {
                image = imgURL;
              }
            });
          });
        }
      });
      const editform = document.getElementById('editForm');
      editform.style.display = 'block';
      document.getElementById('createdKotList').style.display = 'none';
      selectedKot = e.currentTarget.id;
      const ref = database.ref(`Koten/${selectedKot}`);
      ref.on('value', (snapshot) => {
        const data = snapshot.val();
        noImgUrl = data.image;
        if (imgURL === undefined) {
          image = noImgUrl;
        }
        document.getElementById('huurprijs').value = data.huurprijs;
        document.getElementById('waarborg').value = data.waarborg;
        document.getElementById('type').value = data.type;
        document.getElementById('oppervlakte').value = data.oppervlakte;
        document.getElementById('verdieping').value = data.verdieping;
        document.getElementById('personen').value = data.personen;
        document.getElementById('toilet').value = data.toilet;
        document.getElementById('douche').value = data.douche;
        document.getElementById('keuken').value = data.keuken;
        document.getElementById('bemeubeld').value = data.bemeubeld;
        document.getElementById('bemeubeldUitleg').value = data.bemeubeldUitleg;
        document.getElementById('adres').value = data.adres;
        document.getElementById('entiteiten').value = data.entiteiten;
        document.getElementById('opmerking').value = data.opmerking;
      });
    };
    document.getElementById('editSubmit').addEventListener('click', () => {
      document.querySelector('#createdKotList').innerHTML = '';
      document.getElementById('menu').style.display = 'block';
      filter.style.display = 'block';
      if (firebase) {
        const adres = document.getElementById('adres').value;
        const URL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${adres}.json?access_token=${config.mapBoxToken}&cachebuster=1545701868024&autocomplete=true&limit=1`;
        if (config.mapBoxToken) {
          fetch(URL, {
            method: 'GET',
          })
            .then(response => response.json())
            .then((data) => {
              console.log(data);
              const kotLat = JSON.stringify(data.features[0].center[0]);
              const kotLong = JSON.stringify(data.features[0].center[1]);
              const adminUid = firebase.auth().currentUser.uid;
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
              const User = localStorage.getItem('currentAdmin');

              const ref = firebase.database().ref(`Koten/${selectedKot}`);
              ref.set({
                kotLat,
                kotLong,
                adminUid,
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
                user: User,
                image,
              });
              const editform = document.getElementById('editForm');
              editform.style.display = 'none';
              document.querySelector('#createdKotList').style.display = 'block';
              window.location.replace('/#/kotenlijst');
              alert('u heb uw kot aangepast');
            });
        }
      }
    });
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const userid = firebase.auth().currentUser.uid;
        kotRef.on('value', (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            const kot = childSnapshot.val();
            document.querySelector('#createdKotList').innerHTML += `<img class="tinderImage" src=${kot.image}><p>Adres: ${kot.adres}</p><p>Prijs: ${kot.huurprijs}</p><p>Aantal: ${kot.personen}</p><p>kotbaas: ${kot.user}</p>`;
            document.querySelector('#createdKotList').innerHTML += '<br><div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="large" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Delen</a></div>';
            if (userid === kot.adminUid) {
              document.querySelector('#createdKotList').innerHTML += `<button id="${  childSnapshot.key  }" class="editKnop">Edit</button>`;
              document.querySelector('#createdKotList').innerHTML += `<button id="${  childSnapshot.key  }" class="deleteKnop">Remove</button>`;
              const buttons = document.querySelectorAll('.deleteKnop');
              console.log(buttons);
              for (let i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener('click', remove);
              }
              const editButtons = document.querySelectorAll('.editKnop');
              console.log(editButtons);
              for (let i = 0; i < editButtons.length; i++) {
                editButtons[i].addEventListener('click', edit);
              }
            }
          });
        });
      } else {
        window.location.replace('/');
      }
    });
  });
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        if (snapshot.val().adminID === true) {
          document.querySelector('#createdKotList').innerHTML = '';
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/#/adminhome">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/messages">Messages</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/create">Create</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/mapbox">Mapbox</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="#" id="logout">Logout</a></li>';
        } else {
          document.querySelector('#createdKotList').innerHTML = '';
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/#/koten">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/favorite">Favorieten</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/messages">Messages</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/#/mapbox">Mapbox</a></li>';
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
};
