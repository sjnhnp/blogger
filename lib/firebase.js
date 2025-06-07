// ========================================================================
//                           lib/firebase.js
// ========================================================================
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBYobOYTW2tiV8KyC5Dgz6_wV0tIEI59ec",
    authDomain: "iblogger-8eb88.firebaseapp.com",
    projectId: "iblogger-8eb88",
    storageBucket: "iblogger-8eb88.appspot.com",
    messagingSenderId: "720590074748",
    appId: "1:720590074748:web:1726cfb2e502bf2073eaf9"
};

// 初始化 Firebase App (防止重複初始化)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const postsCollectionRef = collection(db, "posts");

export { db, auth, postsCollectionRef };