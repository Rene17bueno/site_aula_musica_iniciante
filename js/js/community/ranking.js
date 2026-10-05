// Ranking dos jogos: pontos por usuario logado, lista Top 10 em tempo real.
// Pontuacao: acerto de primeira = 10 pts, acerto na 2a chance = 5 pts.
// Dados: gameRanking/{jogo}/entries/{uid} (regras em firestore.rules).
import {
    collection, doc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, isFirebaseConfigured } from "./firebase-client.js";
import { observeAuthSession } from "./auth-service.js";

const box = document.getElementById("rankingBox");
const game = box ? box.dataset.game : "";
const GAMES = ["cifras", "diagramas"];
const MEDALS = ["🥇", "🥈", "🥉"];

let session = null;

function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// So o primeiro nome aparece no ranking (privacidade).
function firstName(name) {
    const n = String(name || "").trim().split(/\s+/)[0] || "Aluno";
    return n.slice(0, 20);
}

function renderRows(rows) {
    const list = box.querySelector("[data-rank-list]");
    if (!rows.length) {
        list.innerHTML = '<li class="rank-empty">Ninguém pontuou ainda. Seja o primeiro!</li>';
        return;
    }
    list.innerHTML = rows.map((r, i) => {
        const me = session && session.uid === r.uid ? " rank-me" : "";
        return `<li class="rank-row${me}">
            <span class="rank-pos">${MEDALS[i] || i + 1}</span>
            <span class="rank-name">${esc(r.name)}${me ? " (você)" : ""}</span>
            <span class="rank-pts">${esc(r.points)} pts</span>
        </li>`;
    }).join("");
}

function renderLoginHint() {
    const hint = box.querySelector("[data-rank-hint]");
    hint.innerHTML = session
        ? `Jogando como <strong>${esc(firstName(session.displayName))}</strong>. Seus acertos já contam pontos.`
        : 'Para entrar no ranking, <a href="comunidade.html">entre na Comunidade</a>. Sem login você joga, mas não pontua.';
}

function startRanking() {
    const q = query(collection(db, "gameRanking", game, "entries"), orderBy("points", "desc"), limit(10));
    onSnapshot(q, (snap) => {
        renderRows(snap.docs.map((d) => d.data()));
    }, () => {
        box.querySelector("[data-rank-list]").innerHTML = '<li class="rank-empty">Ranking indisponível no momento.</li>';
    });
}

async function record(points) {
    if (!session || !GAMES.includes(game) || !(points > 0)) return;
    try {
        await setDoc(doc(db, "gameRanking", game, "entries", session.uid), {
            uid: session.uid,
            name: firstName(session.displayName),
            points: increment(points),
            correct: increment(1),
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn("Não foi possível registrar a pontuação.", e);
    }
}

if (box && GAMES.includes(game) && isFirebaseConfigured) {
    window.GameRanking = { record };
    renderLoginHint();
    startRanking();
    observeAuthSession((s) => { session = s; renderLoginHint(); });
} else if (box) {
    box.hidden = true;
}
