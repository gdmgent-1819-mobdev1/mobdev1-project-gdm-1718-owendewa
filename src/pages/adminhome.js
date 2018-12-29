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
