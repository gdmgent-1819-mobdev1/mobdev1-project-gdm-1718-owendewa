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
  console.log('Log: Messages');

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userid = firebase.auth().currentUser.uid;
      // check user type
      const ref = firebase.database().ref(`Users/${userid}`);
      ref.once('value', (snapshot) => {
        if (snapshot.val().adminID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/adminhome">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/create">Create</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        } else if (snapshot.val().userID === true) {
          if (document.getElementById('overlay-content') !== null) {
            document.getElementById('overlay-content').innerHTML = '';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/koten">Home</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/favorite">Favorieten</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/kotenlijst">Kotenlijst</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="/#/mapbox">Mapbox</a>';
            document.getElementById('overlay-content').innerHTML += '<a href="#" id="logout">Logout</a>';
          }
        }
        if (document.getElementById('openMenu') !== null) {
          document.getElementById('openMenu').addEventListener('click', () => {
            document.getElementById('myNav').style.width = '50%';
          });
        }
        if (document.getElementById('closeMenu') !== null) {
          document.getElementById('closeMenu').addEventListener('click', () => {
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
  const ref = firebase.database().ref('Messages');
  ref.orderByChild('date').on('value', (snapshot) => {
    if (document.getElementById('messageBox') !== null) {
      document.getElementById('messageBox').innerHTML = '';
    }
    snapshot.forEach((childSnapshot) => {
      const messages = childSnapshot.val();
      if (firebase.auth().currentUser.uid === messages.senderId || firebase.auth().currentUser.uid === messages.recepient) {
        if (document.getElementById('messageBox') !== null) {
          document.getElementById('messageBox').innerHTML += `<div id="message" ><h3>From: <span class="messageTitle" >${messages.sender}</span></h3>
         <h3>To:  <span class="messageTitle" >${messages.creator} </span></h3>
         <p id="messageContent">Message: ${messages.message}</p>
         <p>Reply: ${messages.reply}</p></div>`;
          if (firebase.auth().currentUser.uid === messages.recepient && messages.reply === '') {
            document.getElementById('messageBox').innerHTML += `<form><textarea id="reply" placeholder="your reply"></textarea><input type="submit" value="antwoord" id="${childSnapshot.key}" class="messageReply"></form>`;
            if (document.querySelector('.messageReply') !== null) {
              document.querySelector('.messageReply').addEventListener('click', (e) => {
                e.preventDefault();
                const key = e.currentTarget.id;
                const reply = document.getElementById('reply').value;
                const messageRef = firebase.database().ref(`Messages/${key}`);
                messageRef.child('reply').set(reply);
                document.getElementById('messageBox').innerHTML = '';
                window.location.replace('/#/messages');
                window.location.reload();
              });
            }
          }
        }
      }
    });
  });
};
