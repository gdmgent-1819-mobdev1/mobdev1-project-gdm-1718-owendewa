// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
// Import the template to use
const adminsigninTemplate = require('../templates/adminsignin.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {      
  // Data to be passed to the template
  const Pagename = 'Signin page';
  // Return the compiled template to the router
  update(compile(adminsigninTemplate, getInstance)({ Pagename }));
  // Admin //
  document.getElementById('adminSignupButton').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup_email').value;
    const password = document.getElementById('signup_password').value;
    const name = document.getElementById('signup_firstname').value;
    const lastname = document.getElementById('signup_lastname').value;
    const phone = document.getElementById('signup_phone').value;
    const adress = document.getElementById('signup_adres').value;
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const postedOn = day + month + year;
    const userID = false;
    const adminID = true;
    console.log(email);
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        const userid = firebase.auth().currentUser.uid;
        firebase.database().ref().child('Users').child(userid).set({
          postedOn,
          name,
          lastname,
          email,
          password,
          phone,
          adress,
          userID,
          adminID,
        });
      })
      .then(() => {
        localStorage.setItem('currentAdmin', email);
        window.location.replace('/?#/kotenlijst');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage + errorCode);
      });
    });
};
