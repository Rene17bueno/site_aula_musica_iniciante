import {
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-client.js";

let persistenceReady = false;

async function ensureSessionPersistence() {
    if (persistenceReady) {
        return;
    }

    await setPersistence(auth, browserSessionPersistence);
    persistenceReady = true;
}

function fallbackName(email) {
    if (!email) {
        return "Usuario";
    }
    return email.split("@")[0];
}

export async function fetchUserProfile(uid) {
    const profileRef = doc(db, "userProfiles", uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
        return null;
    }
    return profileSnap.data();
}

export async function ensureUserProfile(user, partialProfile = {}) {
    const safeName = partialProfile.name || user.displayName || fallbackName(user.email);
    const role = partialProfile.role || "user";

    await setDoc(
        doc(db, "userProfiles", user.uid),
        {
            uid: user.uid,
            email: user.email,
            name: safeName,
            role,
            updatedAt: serverTimestamp(),
            createdAt: partialProfile.createdAt || serverTimestamp()
        },
        { merge: true }
    );

    return {
        uid: user.uid,
        email: user.email,
        name: safeName,
        role
    };
}

export async function signUpWithEmail({ name, email, password }) {
    await ensureSessionPersistence();
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const profile = await ensureUserProfile(credential.user, {
        name,
        role: "user"
    });

    return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: profile.name,
        role: profile.role
    };
}

export async function signInWithEmail({ email, password }) {
    await ensureSessionPersistence();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const user = credential.user;
    const profile = await fetchUserProfile(user.uid);

    if (!profile) {
        const generated = await ensureUserProfile(user);
        return {
            uid: user.uid,
            email: user.email,
            displayName: generated.name,
            role: generated.role
        };
    }

    return {
        uid: user.uid,
        email: user.email,
        displayName: profile.name || fallbackName(user.email),
        role: profile.role || "user"
    };
}

export function observeAuthSession(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (!user) {
            callback(null);
            return;
        }

        const profile = (await fetchUserProfile(user.uid)) || (await ensureUserProfile(user));
        callback({
            uid: user.uid,
            email: user.email,
            displayName: profile.name || fallbackName(user.email),
            role: profile.role || "user"
        });
    });
}

export async function logoutUser() {
    await signOut(auth);
}
