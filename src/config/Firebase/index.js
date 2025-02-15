import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getDatabase} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBWQS42n5JdS4bTNsN_G-Nld5W8b7ZGzy4',
  authDomain: 'mydoctor-17580.firebaseapp.com',
  databaseURL: 'https://mydoctor-17580-default-rtdb.firebaseio.com',
  projectId: 'mydoctor-17580',
  storageBucket: 'mydoctor-17580.firebasestorage.app',
  messagingSenderId: '131710573265',
  appId: '1:131710573265:web:c56d8d734bd8ccbd29c3f0',
  measurementId: 'G-H4YZ2DYKNX',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export {app, auth, db};
