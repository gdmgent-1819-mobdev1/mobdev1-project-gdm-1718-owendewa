// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const adminHomeTemplate = require('../templates/adminhome.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const name = 'login test';
  // Return the compiled template to the router
  update(compile(adminHomeTemplate, getInstance)({ name }));
  const container = document.getElementById('dashbord');
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const id = firebase.auth().currentUser.uid;
      const ref = firebase.database().ref(`Users/${id}`);
      ref.once('value', (snapshot) => {
        const person = snapshot.val();
        container.innerHTML = '';
        container.innerHTML += `<h1>Welkom! <span>${person.name}</span></h1><div id="general"><h2>Beschrijving</h2><p>ProxyKot is een app die gericht staat op het in contact brengen van kotbazen en kotzoekende mensen</p><p>Hierbij word als kotbaas de functies Create/Edit/Delete meegegeven zodat u als kotbaas utieraard uw koten kan beheren</p><p>U kan ook alle koten zien op de kaart die in het menu onder 'Mapbox' staat aangeduid</p><p>Als kotbaas heeft u net zoals een kotzoekende een gepersonaliseerde inbox onder 'messages' in het menu</p><p>Als u een nieuw kot aanmaakt word dit automatisch toegevoegd aan onze algemeene kotenlijst en kan iedere kotzoekende deze zien uw kot zal ook aan het interactieve tinder gebaseerde spel worden toegevoegd</p></div>`;
      });
    }
  });
  console.log(localStorage.getItem('type'));
  document.getElementById('openMenu').addEventListener('click', () => {
    document.getElementById('myNav').style.width = '50%';
  });

  document.getElementById('closeMenu').addEventListener('click', () => {
    document.getElementById('myNav').style.width = '0%';
  });
  const logout = () => {
    firebase.auth().signOut();
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLong');
    localStorage.removeItem('userLat');
    localStorage.removeItem('type');
  };
  document.getElementById('logout').addEventListener('click', logout);
};
