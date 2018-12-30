// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const homeTemplate = require('../templates/home.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const currentuser = 'Test user';
  // Return the compiled template to the router
  update(compile(homeTemplate)({ currentuser }));
  console.log('Log: Home');
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        if (snapshot.val().adminID === true) {
          window.location.replace('/#/adminhome');
        } else {
          window.location.replace('/#/koten');
        }
      });
    }
  });
};
