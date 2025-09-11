import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  set, 
  update, 
  get, 
  child 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// 🔧 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB35rgDqqlPUsPf0UCy_IK-NbfvsPpz-4c",
  authDomain: "plant-1942d.firebaseapp.com",
  projectId: "plant-1942d",
  storageBucket: "plant-1942d.appspot.com",
  messagingSenderId: "331323609056",
  appId: "1:331323609056:web:f18927ae71279cd6ff2585",
  measurementId: "G-5H86EBSWGL"
};

// 🔧 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// 🎯 Simpan / update user ke Realtime Database
async function saveUserToDB(user, provider) {
  const userRef = ref(db, "users/" + user.uid);

  const snapshot = await get(child(ref(db), "users/" + user.uid));
  if (snapshot.exists()) {
    await update(userRef, {
      updated_at: new Date().toISOString()
    });
    console.log("ℹ️ User lama login, updated_at diperbarui");
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
}

// ✅ Login pakai Email
document.getElementById("emailLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("❌ Email dan password harus diisi!");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    await saveUserToDB(userCred.user, "email");
    alert("✅ Login Email berhasil!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ Error Email Login:", err);
    alert(err.message);
  }
});

// ✅ Login pakai Google
document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToDB(result.user, "google");
    alert("✅ Login Google berhasil!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ Error Google Login:", err);
    alert(err.message);
  }
});

// ✅ Login pakai Facebook
document.getElementById("facebookLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await saveUserToDB(result.user, "facebook");
    alert("✅ Login Facebook berhasil!");
    window.location.href = "index.html";
  } catch (err) {
    console.error("❌ Error Facebook Login:", err);
    alert(err.message);
  }
});

// 🔄 Auto redirect kalau user sudah login
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User sudah login:", user.email);
    if (!window.location.pathname.includes("index.html")) {
      window.location.href = "index.html";
    }
  }
});
