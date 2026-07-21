import {
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
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

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeWhatsapp(value) {
    return String(value || "").replace(/\D+/g, "");
}

function normalizeInstagram(value) {
    const base = String(value || "").trim().toLowerCase().replace(/^@+/, "");
    if (!base) {
        return "";
    }
    return `@${base}`;
}

function isEmailIdentifier(value) {
    return /.+@.+\..+/.test(String(value || "").trim());
}

function aliasDocId(kind, value) {
    return `${kind}:${value}`;
}

async function upsertAuthAliases({ uid, email, whatsapp, instagram }) {
    const tasks = [];
    const safeEmail = normalizeEmail(email);
    const safeWhatsapp = normalizeWhatsapp(whatsapp);
    const safeInstagram = normalizeInstagram(instagram);

    if (safeEmail) {
        tasks.push(
            setDoc(doc(db, "authAliases", aliasDocId("email", safeEmail)), {
                uid,
                email: safeEmail,
                kind: "email",
                updatedAt: serverTimestamp()
            }, { merge: true })
        );
    }

    if (safeWhatsapp) {
        tasks.push(
            setDoc(doc(db, "authAliases", aliasDocId("wa", safeWhatsapp)), {
                uid,
                email: safeEmail,
                kind: "wa",
                updatedAt: serverTimestamp()
            }, { merge: true })
        );
    }

    if (safeInstagram) {
        tasks.push(
            setDoc(doc(db, "authAliases", aliasDocId("ig", safeInstagram)), {
                uid,
                email: safeEmail,
                kind: "ig",
                updatedAt: serverTimestamp()
            }, { merge: true })
        );
    }

    await Promise.all(tasks);
}

async function resolveEmailFromIdentifier(identifier) {
    const raw = String(identifier || "").trim();
    if (!raw) {
        throw new Error("Informe email, WhatsApp ou @Instagram.");
    }

    if (isEmailIdentifier(raw)) {
        return normalizeEmail(raw);
    }

    const asWhatsapp = normalizeWhatsapp(raw);
    const asInstagram = normalizeInstagram(raw);

    const docIds = [];
    if (asWhatsapp.length >= 8) {
        docIds.push(aliasDocId("wa", asWhatsapp));
    }
    if (asInstagram) {
        docIds.push(aliasDocId("ig", asInstagram));
    }

    for (const id of docIds) {
        const aliasSnap = await getDoc(doc(db, "authAliases", id));
        if (aliasSnap.exists()) {
            const data = aliasSnap.data();
            if (data?.email) {
                return normalizeEmail(data.email);
            }
        }
    }

    throw new Error("Nao encontramos conta com esse identificador. Tente email, WhatsApp ou @Instagram cadastrado.");
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
    const whatsappNormalized = normalizeWhatsapp(partialProfile.whatsapp || "");
    const instagramNormalized = normalizeInstagram(partialProfile.instagram || "");

    await setDoc(
        doc(db, "userProfiles", user.uid),
        {
            uid: user.uid,
            email: user.email,
            name: safeName,
            role,
            whatsapp: partialProfile.whatsapp || "",
            whatsappNormalized,
            instagram: partialProfile.instagram || "",
            instagramNormalized,
            updatedAt: serverTimestamp(),
            createdAt: partialProfile.createdAt || serverTimestamp()
        },
        { merge: true }
    );

    await upsertAuthAliases({
        uid: user.uid,
        email: user.email,
        whatsapp: partialProfile.whatsapp || "",
        instagram: partialProfile.instagram || ""
    });

    return {
        uid: user.uid,
        email: user.email,
        name: safeName,
        role,
        whatsapp: partialProfile.whatsapp || "",
        instagram: partialProfile.instagram || ""
    };
}

export async function signUpWithEmail({ name, email, password, whatsapp, instagram }) {
    await ensureSessionPersistence();
    const safeEmail = normalizeEmail(email);
    const credential = await createUserWithEmailAndPassword(auth, safeEmail, password);
    const profile = await ensureUserProfile(credential.user, {
        name,
        role: "user",
        whatsapp,
        instagram
    });

    return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: profile.name,
        role: profile.role
    };
}

export async function signInWithEmail({ identifier, email, password }) {
    await ensureSessionPersistence();
    const loginIdentifier = identifier || email;
    const resolvedEmail = await resolveEmailFromIdentifier(loginIdentifier);
    const credential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
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

    await upsertAuthAliases({
        uid: user.uid,
        email: user.email,
        whatsapp: profile.whatsapp || "",
        instagram: profile.instagram || ""
    });

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

export async function sendResetPasswordEmail(identifier) {
    const resolvedEmail = await resolveEmailFromIdentifier(identifier);
    await sendPasswordResetEmail(auth, resolvedEmail);
}
