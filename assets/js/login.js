import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB35rgDqqlPUsPf0UCy_IK-NbfvsPpz-4c",
  authDomain: "plant-1942d.firebaseapp.com",
  projectId: "plant-1942d",
  storageBucket: "plant-1942d.appspot.com",
  messagingSenderId: "331323609056",
  appId: "1:331323609056:web:f18927ae71279cd6ff2585",
  measurementId: "G-5H86EBSWGL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Google Login
document.getElementById("googleLogin").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Login Google berhasil:", result.user.displayName);
    window.location.href = "index.html";
  } catch (err) {
    alert("Google Login Error: " + err.message);
  }
});

// 🔹 Facebook Login
document.getElementById("facebookLogin").addEventListener("click", async () => {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Login Facebook berhasil:", result.user.displayName);
    window.location.href = "index.html";
  } catch (err) {
    alert("Facebook Login Error: " + err.message);
  }
});

// 🔹 Email Login
document.getElementById("emailLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email dan password harus diisi!");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login Email berhasil:", userCredential.user.email);
    window.location.href = "index.html";
  } catch (err) {
    alert("Email Login Error: " + err.message);
  }
});

// 🔹 Auto redirect kalau user sudah login
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.indexOf("index.html") === -1) {
    console.log("User sudah login, redirect ke dashboard:", user.email);
    window.location.href = "index.html";
  }
});
