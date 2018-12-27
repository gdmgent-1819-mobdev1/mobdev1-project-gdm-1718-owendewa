// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Import the template to use
const messagesTemplate = require('../templates/messages.handlebars');
const { getInstance } = require('../firebase/firebase');

const firebase = getInstance();

export default () => {
  // Data to be passed to the template
  const name = 'Test inc.';
  // Return the compiled template to the router
  update(compile(messagesTemplate)({ name }));
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        console.log(snapshot.val());
        if (snapshot.val().adminID === true) {
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/adminhome">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/create">Create</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/kotenlijst">Kotenlijst</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/mapbox">Mapbox</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="#" id="logout">Logout</a></li>';
        } else {
          document.getElementById('menu').innerHTML = '';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/koten">Home</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/favorite">Favorieten</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/messages">Messages</a></li>';
          document.getElementById('menu').innerHTML += '<li><a href="/?#/mapbox">Mapbox</a></li>';
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
  const ref = firebase.database().ref('Messages');
  ref.on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const messages = childSnapshot.val();
      if (firebase.auth().currentUser.uid === messages.senderId || firebase.auth().currentUser.uid === messages.recepient) {
        document.getElementById('messageBox').innerHTML += 'From: ' + messages.sender + '<br>';
        document.getElementById('messageBox').innerHTML += 'To: ' + messages.creator + '<br>';
        document.getElementById('messageBox').innerHTML += 'From: ' + messages.message + '<br>';
        document.getElementById('messageBox').innerHTML += 'Reply: ' + messages.reply + '<br>';
        if (firebase.auth().currentUser.uid === messages.recepient && messages.reply === '') {
          document.getElementById('messageBox').innerHTML += '<form><textarea id="reply" placeholder="your reply"></textarea><input type="submit" value="antwoord" id="' + childSnapshot.key+ '" class="messageReply"></form>';
        }
        document.getElementById('messageBox').innerHTML += '<br><br>';
      }
    });
  });
  document.querySelector('.messageReply').addEventListener('click', (e) => {
    e.preventDefault(); 
    const key = e.currentTarget.id;
    const reply = document.getElementById('reply').value;
    const messageRef = firebase.database().ref('Messages/' + key);
    messageRef.child('reply').set(reply);
    document.getElementById('messageBox').innerHTML = '';
    window.location.replace('/?#/adminhome');
    alert('Reply gegeven');
  });
};
