
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
  console.log('Log: Kotenlijst');

  const filter = document.getElementById('filterBox');
  let kotRef;

  filter.addEventListener('change', () => {
    if (filter.value === '1') {
      kotRef = firebase.database().ref('Koten');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '2') {
      kotRef = firebase.database().ref('Koten').orderByChild('huurprijs');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '3') {
      kotRef = firebase.database().ref('Koten').orderByChild('oppervlakte');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '4') {
      kotRef = firebase.database().ref('Koten').orderByChild('type');
      document.querySelector('#createdKotList').innerHTML = '';
    } else if (filter.value === '5') {
      kotRef = firebase.database().ref('Koten').orderByChild('toUser');
      document.querySelector('#createdKotList').innerHTML = '';
    }
    let selectedKot;
    let image;
    let imagePath;
    let imgURL;
    let noImgUrl;
    const remove = (e) => {
      e.preventDefault();
      selectedKot = e.currentTarget.id;
      const ref = database.ref(`Koten/${selectedKot}`);
      ref.remove();
      document.querySelector('#createdKotList').innerHTML = '';
      window.location.replace('/#/kotenlijst');
      window.location.reload();
    };
    const edit = (e) => {
      e.preventDefault();
      filter.style.display = 'none';
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
    document.getElementById('editSubmit').addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#createdKotList').innerHTML = '';
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
            console.log(kot);
            if (localStorage.getItem('type') !== 'Admin') {
              document.querySelector('#createdKotList').innerHTML += `<div id="kotBox"><h1>${kot.type} te huur</h1><p>${kot.adres}</p><img class="displayImage" src=${kot.image}><h2>Algemene Info</h2><p id="afstand">Kot ligt op ${kot.toUser}m afstand</p><p>€${kot.huurprijs} / maand</p><p>Oppervlakte: ${kot.oppervlakte}m&sup2;</p><p>€${kot.waarborg} / waarborg</p><p>Verdieping: ${kot.verdieping}</p><h2>Sanitaire Info</h2><p>Douche ${kot.douche}</p><p>Toilet ${kot.toilet}</p><div id="kotBoxButtons" ><div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="large" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Delen</a><a href="#" id="contactKnop">Contact</a><a href="#" id="${childSnapshot.key}" class="favorietKnop">Favorite</a></div></div>`;
              const Contact = (e) => {
                e.preventDefault();
                const noscroll = () => {
                  window.scrollTo(0, 0);
                };
                window.addEventListener('scroll', noscroll);
                document.getElementById('contactForm').style.display = 'block';
                document.getElementById('contactForm').innerHTML = '';
                document.getElementById('contactForm').innerHTML += '<form id="kotlijstContact"><button id="kotenlijstMessageClose">&times;</button><h1>Contact</h1><textarea id="message" placeholder="Geef uw boodschap hierin"></textarea><input type="submit" id="sendMessage" value="Send"></form>';
                // POPUP CLOSE
                document.getElementById('kotenlijstMessageClose').addEventListener('click', (evt) => {
                  evt.preventDefault();
                  document.getElementById('contactForm').style.display = 'none';
                  window.removeEventListener('scroll', noscroll);
                });
                document.getElementById('sendMessage').addEventListener('click', (evt) => {
                  evt.preventDefault();
                  window.removeEventListener('scroll', noscroll);
                  const ref = firebase.database().ref('Messages');
                  const message = document.getElementById('message').value;
                  const adres = kot.adres;
                  const creator = kot.user;
                  const sender = firebase.auth().currentUser.email;
                  const senderId = firebase.auth().currentUser.uid;
                  const recepient = kot.adminUid;
                  const reply = '';
                  const Data = {
                    message,
                    adres,
                    sender,
                    senderId,
                    recepient,
                    creator,
                    reply,
                  };
                  ref.push(Data);
                  document.getElementById('contactForm').style.display = 'none';
                });
              };
              const contactButtons = document.querySelectorAll('#contactKnop');
              for (let i = 0; i < contactButtons.length; i++) {
                contactButtons[i].addEventListener('click', Contact);
              }
              const Favorite = (e) => {
                e.preventDefault();
                const currentUser = firebase.auth().currentUser.uid;
                const ref = firebase.database().ref('Favorieten');
                const selectedFavoKot = e.currentTarget.id;
                const selectedFavoKotTwee = firebase.database().ref(`Koten/${selectedFavoKot}`);
                console.log(selectedFavoKot);
                console.log(selectedFavoKotTwee);
                selectedFavoKotTwee.on('value', (snapshot) => {
                  console.log(snapshot.val());
                  const image = snapshot.val().image;
                  const adres = snapshot.val().adres;
                  const user = snapshot.val().user;
                  const huurprijs = snapshot.val().huurprijs;
                  const waarborg = snapshot.val().waarborg;
                  const type = snapshot.val().type;
                  const oppervlakte = snapshot.val().oppervlakte;
                  const verdieping = snapshot.val().verdieping;
                  const personen = snapshot.val().personen;
                  const toilet = snapshot.val().toilet;
                  const douche = snapshot.val().douche;
                  const keuken = snapshot.val().keuken;
                  const bemeubeld = snapshot.val().bemeubeld;
                  const bemeubeldUitleg = snapshot.val().bemeubeldUitleg;
                  const entiteiten = snapshot.val().entiteiten;
                  const opmerking = snapshot.val().opmerking;
                  const afstand = snapshot.val().toUser;
                  const favoData = {
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
                  console.log(favoData);
                  ref.push(favoData);
                  alert('Toegevoegd aan favoriten');
                });
              };
              const favoriteButtons = document.querySelectorAll('.favorietKnop');
              for (let i = 0; i < favoriteButtons.length; i++) {
                favoriteButtons[i].addEventListener('click', Favorite);
              }
            } else if (localStorage.getItem('type') === 'Admin' && userid === kot.adminUid) {
              document.querySelector('#createdKotList').innerHTML += `<div id="kotBox"><h1>${kot.type} te huur</h1><p>${kot.adres}</p><img class="displayImage" src=${kot.image}><h2>Algemene Info</h2><p>€${kot.huurprijs} / maand</p><p>Oppervlakte: ${kot.oppervlakte}m&sup2;</p><p>€${kot.waarborg} / waarborg</p><p>Verdieping: ${kot.verdieping}</p><h2>Sanitaire Info</h2><p>Douche ${kot.douche}</p><p>Toilet ${kot.toilet}</p><div id="kotBoxButtons" ><div class="fb-share-button" data-href="https://developers.facebook.com/docs/plugins/" data-layout="button" data-size="large" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Delen</a><button id="${childSnapshot.key}" class="editKnop">Edit</button><button id="${childSnapshot.key}" class="deleteKnop">Remove</button></div></div>`;
              const buttons = document.querySelectorAll('.deleteKnop');
              for (let i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener('click', remove);
              }
              const editButtons = document.querySelectorAll('.editKnop');
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
          if (document.querySelector('#createdKotList' !== null)) {
            document.querySelector('#createdKotList').innerHTML = '';
          }
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/adminhome">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/messages">Messages</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/create">Create</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        } else if (snapshot.val().userID === true) {
          if (document.querySelector('#createdKotList' !== null)) {
            document.querySelector('#createdKotList').innerHTML = '';
          }
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
          document.getElementById('openMenu').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('myNav').style.width = '50%';
          });
        }
        if (document.getElementById('closeMenu') !== null) {
          document.getElementById('closeMenu').addEventListener('click', (e) => {
            e.preventDefault();
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
};
