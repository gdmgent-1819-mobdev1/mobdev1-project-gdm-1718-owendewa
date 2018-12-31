// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const userloginTemplate = require('../templates/userlogin.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const name = 'login test';
  // Return the compiled template to the router
  update(compile(userloginTemplate, getInstance)({ name }));
  console.log('Log: userlogin');
  const reset = (e) => {
    e.preventDefault();
    const auth = firebase.auth();
    const emailAddress = document.getElementById('login_email').value;
    if (emailAddress === '') {
      alert('gelieve email in te geven');
    } else if (emailAddress !== '') {
      auth.sendPasswordResetEmail(emailAddress).then(() => {
        alert('Reset is verzonden naar '+emailAddress);
      }).catch((error) => {
      // An error happened.
      });
    }
  };
  document.getElementById('forgot').addEventListener('click', reset);

  const login = (e) => {
    e.preventDefault();
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        alert('User is ingelogd');
        window.location.replace('/#/koten');
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
  document.getElementById('userLoginButton').addEventListener('click', login);
};
