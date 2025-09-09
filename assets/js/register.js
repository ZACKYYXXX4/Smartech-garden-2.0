import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const db = getFirestore(app);

// Register User
document.getElementById("registerBtn").addEventListener("click", async () => {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  if (!name || !email || !password) {
    alert("Nama, email, dan password harus diisi!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile dengan nama & avatar default
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: "https://example.com/avatar/default.jpg"
    });

    // Simpan user ke Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: name,
      email: email,
      provider: "email",
      avatar: "https://example.com/avatar/default.jpg",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    alert("Registrasi berhasil! Silakan login.");
    window.location.href = "login.html";

  } catch (err) {
    alert("Registrasi Error: " + err.message);
  }
});
