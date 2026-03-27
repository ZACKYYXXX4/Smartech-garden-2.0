import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  onAuthStateChanged,
  fetchSignInMethodsForEmail
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


// ==============================
// 🔥 HELPER AUTO REDIRECT LOGIN
// ==============================
async function handleCredentialError(err) {
  if (err.code === "auth/account-exists-with-different-credential") {
    const email = err.customData.email;

    const methods = await fetchSignInMethodsForEmail(auth, email);

    console.log("⚠️ Email sudah terdaftar dengan:", methods);

    // 🔥 AUTO REDIRECT
    if (methods.includes("google.com")) {
      alert("Akun ini terdaftar dengan Google. Mengalihkan...");
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToDB(result.user, "google");
      window.location.href = "index.html";
    } 
    else if (methods.includes("facebook.com")) {
      alert("Akun ini terdaftar dengan Facebook. Silakan login ulang.");
    } 
    else if (methods.includes("password")) {
      alert("Gunakan login Email & Password!");
    } 
    else {
      alert("Metode login tidak dikenali.");
    }
  } else {
    alert(err.message);
  }
}


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


// ==============================
// ✅ LOGIN EMAIL (TETAP)
// ==============================
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


// ==============================
// ✅ LOGIN GOOGLE (UPGRADE)
// ==============================
document.getElementById("googleLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToDB(result.user, "google");
    alert("✅ Login Google berhasil!");
    window.location.href = "index.html";

  } catch (err) {
    console.error("❌ Error Google Login:", err);
    await handleCredentialError(err);
  }
});


// ==============================
// ✅ LOGIN FACEBOOK (UPGRADE)
// ==============================
document.getElementById("facebookLogin").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    await saveUserToDB(result.user, "facebook");
    alert("✅ Login Facebook berhasil!");
    window.location.href = "index.html";

  } catch (err) {
    console.error("❌ Error Facebook Login:", err);
    await handleCredentialError(err);
  }
});


// ==============================
// 🔄 AUTO REDIRECT
// ==============================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User sudah login:", user.email);
    if (!window.location.pathname.includes("index.html")) {
      window.location.href = "index.html";
    }
  }
});
