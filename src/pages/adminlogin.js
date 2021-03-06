// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const adminloginTemplate = require('../templates/adminlogin.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const name = 'login test';
  // Return the compiled template to the router
  update(compile(adminloginTemplate, getInstance)({ name }));
  console.log('Log: Adminlogin');
  const login = (e) => {
    e.preventDefault();
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        localStorage.setItem('currentAdmin', email);
        localStorage.setItem('type', 'Admin');
        window.location.replace('/#/adminhome');
      })
      .catch((error) => {
      // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // show errors in console
        alert(errorMessage + errorCode);
      });
    // localStorage.setItem('user', email);
  };
  document.getElementById('adminLoginButton').addEventListener('click', login);
};
