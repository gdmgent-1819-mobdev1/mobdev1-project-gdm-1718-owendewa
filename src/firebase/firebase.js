const firebaseInstance = require('firebase');

// Initialize Firebase
// TODO: Replace with your project's config
const config = {
  apiKey: 'AIzaSyDJ3M061YEv6T7xzDuqLfiTkAlypcyI5Bc',
  authDomain: 'mobdev-owendewaele.firebaseapp.com',
  databaseURL: 'https://mobdev-owendewaele.firebaseio.com',
  projectId: 'mobdev-owendewaele',
  storageBucket: 'mobdev-owendewaele.appspot.com',
  messagingSenderId: '1085555009573',
};

let instance = null;

const initFirebase = () => {
  instance = firebaseInstance.initializeApp(config);
};

const getInstance = () => {
  if (!instance) {
    initFirebase();
  }
  return instance;
};
export {
  initFirebase,
  getInstance,
};