import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  update, 
  get, 
  child 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB35rgDqqlPUsPf0UCy_IK-NbfvsPpz-4c",
  authDomain: "plant-1942d.firebaseapp.com",
  databaseURL: "https://plant-1942d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "plant-1942d",
  storageBucket: "plant-1942d.appspot.com",
  messagingSenderId: "331323609056",
  appId: "1:331323609056:web:f18927ae71279cd6ff2585",
  measurementId: "G-5H86EBSWGL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

async function saveUserToDB(user, provider) {
  const userRef = ref(db, "users/" + user.uid);

  try {
    const snapshot = await get(child(ref(db), "users/" + user.uid));
    if (snapshot.exists()) {
      await update(userRef, {
        updated_at: new Date().toISOString()
      });
      console.log("ℹ️ User lama login ulang, updated_at diperbarui");
    } else {
      await set(userRef, {
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        provider: provider,
        avatar: user.photoURL || "https://example.com/avatar/default.jpg",
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log("✅ User baru disimpan ke DB");
    }
  } catch (err) {
    console.error("❌ Gagal save ke DB:", err);
    alert("Error save user: " + err.message);
  }
}

document.getElementById("registerBtn").addEventListener("click", async () => {
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  if (!email || !password) {
    alert("❌ Email dan password harus diisi!");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCred.user, { displayName: email.split("@")[0] });
    await saveUserToDB(userCred.user, "email");

    alert("✅ Registrasi berhasil! Silakan login.");
    window.location.href = "login_pages.html";
  } catch (err) {
    console.error("❌ Error register:", err);
    alert(err.message);
  }
});

document.getElementById("googleRegister").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToDB(result.user, "google");
    alert("✅ Registrasi dengan Google berhasil!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ Error Google:", err);
    alert(err.message);
  }
});

document.getElementById("facebookRegister").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await saveUserToDB(result.user, "facebook");
    alert("✅ Registrasi dengan Facebook berhasil!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ Error Facebook:", err);
    alert(err.message);
  }
});

