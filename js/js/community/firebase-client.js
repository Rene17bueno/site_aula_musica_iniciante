import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];

export const isFirebaseConfigured = requiredKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === "string" && value.trim() !== "" && !value.startsWith("SEU_") && !value.startsWith("SUA_");
});

if (!isFirebaseConfigured) {
    console.warn("Firebase nao configurado. Preencha js/js/community/firebase-config.js.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
