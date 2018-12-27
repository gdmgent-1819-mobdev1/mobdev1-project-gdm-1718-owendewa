// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
// Import the template to use
const usersigninTemplate = require('../templates/usersignin.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const Pagename = 'Signin page';
  // Return the compiled template to the router
  update(compile(usersigninTemplate, getInstance)({ Pagename }));
  // USER //
  document.getElementById('userSignupButton').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('signup_email').value;
    const password = document.getElementById('signup_password').value;
    const name = document.getElementById('signup_firstname').value;
    const lastname = document.getElementById('signup_lastname').value;
    const phone = document.getElementById('signup_phone').value;
    const adress = document.getElementById('signup_adres').value;
    const select = document.getElementById('campus').value;
    const selectedCampus = document.getElementById('campus');
    const campus = selectedCampus.options[selectedCampus.selectedIndex].text;
    let long = 0;
    let lat = 0;
    if (select === '1') {
      long = 3.670820;
      lat = 51.087551;
    } else if (select === '2') {
      long = 3.728000;
      lat = 51.040970;
    } else if (select === '3') {
      long = 3.708860;
      lat = 51.060800;
    }
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const postedOn = day + month + year;
    const userID = true;
    const adminID = false;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        const userid = firebase.auth().currentUser.uid;
        firebase.database().ref().child('Users').child(userid).set({
          postedOn,
          name,
          lastname,
          email,
          password,
          campus,
          long,
          lat,
          phone,
          adress,
          userID,
          adminID,
        });
        window.location.replace('/#/koten');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage + errorCode);
      });
  });
};
