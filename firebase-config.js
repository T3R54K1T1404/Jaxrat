// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Konfigurasi FIREBASE PUNYA LO (Jangan sampe salah)
const firebaseConfig = {
  apiKey: "AIzaSyDzA92c3IoyjhiFft3Ci6cpsvEJBXAzIfQ",
  authDomain: "jaxrat-6813c.firebaseapp.com",
  databaseURL: "https://jaxrat-6813c-default-rtdb.firebaseio.com",
  projectId: "jaxrat-6813c",
  storageBucket: "jaxrat-6813c.firebasestorage.app",
  messagingSenderId: "750985295231",
  appId: "1:750985295231:web:0679d4b998e52256e4d64a"
};

// Inisialisasi
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Export biar bisa dipake di file HTML lain
export { auth, database, signInWithEmailAndPassword, signOut, ref, set, get, child };
