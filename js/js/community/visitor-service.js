import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-client.js";

export async function submitVisitorEntry({ user, name, email, topic, message }) {
    if (!user?.uid) {
        throw new Error("Você precisa estar autenticado para enviar o formulário.");
    }

    if (!name || !email || !topic || !message) {
        throw new Error("Preencha todos os campos do formulário.");
    }

    await addDoc(collection(db, "visitorEntries"), {
        uid: user.uid,
        userEmail: user.email,
        userRole: user.role || "user",
        name,
        email,
        topic,
        message,
        createdAt: serverTimestamp(),
        status: "new"
    });
}
