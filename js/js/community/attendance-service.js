import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-client.js";

function attendanceDocId(sessionId, uid) {
    return `${sessionId}_${uid}`;
}

export function subscribeClassSessions(callback) {
    const sessionsQuery = query(collection(db, "classSessions"), orderBy("classDate", "desc"));
    return onSnapshot(sessionsQuery, (snapshot) => {
        callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
}

export function subscribeAttendanceByUser(uid, callback) {
    const attendanceQuery = query(
        collection(db, "attendanceRecords"),
        where("uid", "==", uid),
        orderBy("classDate", "desc")
    );

    return onSnapshot(attendanceQuery, (snapshot) => {
        callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
}

export function subscribeAttendanceBySession(sessionId, callback) {
    const attendanceQuery = query(
        collection(db, "attendanceRecords"),
        where("sessionId", "==", sessionId),
        orderBy("studentName", "asc")
    );

    return onSnapshot(attendanceQuery, (snapshot) => {
        callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
}

export async function upsertClassSession({ classDate, weekday, hasClass, note, updatedBy }) {
    await setDoc(doc(db, "classSessions", classDate), {
        classDate,
        weekday,
        hasClass: Boolean(hasClass),
        note: note || "",
        updatedBy,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
    }, { merge: true });
}

export async function markAttendance({ session, classSession, status }) {
    if (!session?.uid) {
        throw new Error("Sessao invalida para marcar presenca.");
    }

    if (!classSession?.classDate) {
        throw new Error("Selecione uma aula valida.");
    }

    await setDoc(doc(db, "attendanceRecords", attendanceDocId(classSession.id || classSession.classDate, session.uid)), {
        sessionId: classSession.id || classSession.classDate,
        classDate: classSession.classDate,
        weekday: classSession.weekday || "",
        hasClass: Boolean(classSession.hasClass),
        uid: session.uid,
        studentName: session.displayName || "Aluno",
        studentEmail: session.email || "",
        status,
        markedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });
}
