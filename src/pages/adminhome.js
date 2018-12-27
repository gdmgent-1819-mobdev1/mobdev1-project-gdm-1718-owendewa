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
  const logout = () => {
    firebase.auth().signOut();
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('currentUser');
  };
  document.getElementById('logout').addEventListener('click', logout);
};
