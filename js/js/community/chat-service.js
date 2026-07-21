import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getDownloadURL,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { db, storage } from "./firebase-client.js";

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadAttachment(threadId, file) {
    if (!file) {
        return null;
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
        throw new Error("Anexe somente imagem ou video.");
    }

    const fileName = `${Date.now()}_${sanitizeFilename(file.name)}`;
    const fileRef = ref(storage, `chatAttachments/${threadId}/${fileName}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    return {
        url,
        mimeType: file.type,
        name: file.name,
        size: file.size,
        kind: isImage ? "image" : "video"
    };
}

export async function sendChatMessage({ threadId, sender, text, file }) {
    const trimmedText = (text || "").trim();
    if (!threadId) {
        throw new Error("Conversa invalida.");
    }

    if (!trimmedText && !file) {
        throw new Error("Digite uma mensagem ou anexe um arquivo.");
    }

    const attachment = await uploadAttachment(threadId, file);

    await addDoc(collection(db, "chats", threadId, "messages"), {
        text: trimmedText,
        attachment,
        senderId: sender.uid,
        senderName: sender.displayName,
        senderEmail: sender.email,
        senderRole: sender.role || "user",
        createdAt: serverTimestamp()
    });

    await setDoc(
        doc(db, "chats", threadId),
        {
            threadId,
            userId: threadId,
            userName: sender.role === "admin" ? null : sender.displayName,
            userEmail: sender.role === "admin" ? null : sender.email,
            updatedAt: serverTimestamp(),
            lastMessagePreview: trimmedText || (attachment ? `[${attachment.kind}] ${attachment.name}` : "")
        },
        { merge: true }
    );
}

export function subscribeThreadMessages(threadId, callback) {
    const messagesQuery = query(
        collection(db, "chats", threadId, "messages"),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));
        callback(messages);
    });
}

export function subscribeAdminThreads(callback) {
    const threadsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"), limit(80));

    return onSnapshot(threadsQuery, (snapshot) => {
        const threads = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));
        callback(threads);
    });
}
