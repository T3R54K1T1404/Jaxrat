// PATH: /firebase-config.js

// Firebase configuration dari project lo
const firebaseConfig = {
  apiKey: "AIzaSyDzA92c3IoyjhiFft3Ci6cpsvEJBXAzIfQ",
  authDomain: "jaxrat-6813c.firebaseapp.com",
  databaseURL: "https://jaxrat-6813c-default-rtdb.firebaseio.com",
  projectId: "jaxrat-6813c",
  storageBucket: "jaxrat-6813c.firebasestorage.app",
  messagingSenderId: "750985295231",
  appId: "1:750985295231:web:0679d4b998e52256e4d64a"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
