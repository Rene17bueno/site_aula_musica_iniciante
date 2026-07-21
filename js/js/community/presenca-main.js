import { isFirebaseConfigured } from "./firebase-client.js";
import { observeAuthSession } from "./auth-service.js";
import {
    markAttendance,
    subscribeAttendanceByUser,
    subscribeClassSessions
} from "./attendance-service.js";

const state = {
    session: null,
    sessions: [],
    selectedSessionId: "",
    unsubscribeSessions: null,
    unsubscribeAttendance: null
};

const dom = {
    authAlert: document.getElementById("attendance-auth-alert"),
    markAlert: document.getElementById("attendance-mark-alert"),
    userBadge: document.getElementById("attendance-user"),
    sessionSelect: document.getElementById("attendance-session-select"),
    markPresent: document.getElementById("btn-mark-present"),
    markAbsent: document.getElementById("btn-mark-absent"),
    historyBody: document.getElementById("attendance-history-body")
};

function showAlert(target, message, type = "error") {
    if (!target) {
        return;
    }
    target.textContent = message;
    target.className = `community-alert ${type}`;
    target.style.display = "block";
}

function clearAlert(target) {
    if (!target) {
        return;
    }
    target.textContent = "";
    target.className = "community-alert";
    target.style.display = "none";
}

function formatTimestamp(value) {
    const date = value?.toDate ? value.toDate() : null;
    if (!date) {
        return "-";
    }
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function formatClassDate(dateText) {
    if (!dateText) {
        return "-";
    }
    const [y, m, d] = String(dateText).split("-");
    if (!y || !m || !d) {
        return dateText;
    }
    return `${d}/${m}/${y}`;
}

function statusLabel(status) {
    if (status === "present") {
        return "Presente";
    }
    if (status === "absent") {
        return "Ausente";
    }
    return "-";
}

function renderSessionOptions() {
    const validSessions = state.sessions.filter((item) => item.hasClass);

    if (!validSessions.length) {
        dom.sessionSelect.innerHTML = '<option value="">Nenhuma aula confirmada</option>';
        dom.sessionSelect.disabled = true;
        state.selectedSessionId = "";
        return;
    }

    dom.sessionSelect.disabled = !state.session;

    if (!state.selectedSessionId || !validSessions.some((item) => item.id === state.selectedSessionId)) {
        state.selectedSessionId = validSessions[0].id;
    }

    dom.sessionSelect.innerHTML = validSessions
        .map((item) => {
            const selected = item.id === state.selectedSessionId ? "selected" : "";
            return `<option value="${item.id}" ${selected}>${formatClassDate(item.classDate)} · ${item.weekday || "Dia nao informado"}</option>`;
        })
        .join("");
}

function renderAttendanceHistory(records) {
    if (!records.length) {
        dom.historyBody.innerHTML = '<tr><td colspan="4" class="attendance-empty">Sem marcacoes de presenca ainda.</td></tr>';
        return;
    }

    dom.historyBody.innerHTML = records
        .map((item) => `
            <tr>
                <td>${formatClassDate(item.classDate)}</td>
                <td>${item.weekday || "-"}</td>
                <td>${statusLabel(item.status)}</td>
                <td>${formatTimestamp(item.updatedAt || item.markedAt)}</td>
            </tr>
        `)
        .join("");
}

function selectedSession() {
    return state.sessions.find((item) => item.id === state.selectedSessionId) || null;
}

async function submitAttendance(status) {
    clearAlert(dom.markAlert);

    if (!state.session) {
        showAlert(dom.markAlert, "Faca login na comunidade para marcar presenca.");
        return;
    }

    const sessionRow = selectedSession();
    if (!sessionRow) {
        showAlert(dom.markAlert, "Nao ha aula selecionada para marcar.");
        return;
    }

    try {
        await markAttendance({
            session: state.session,
            classSession: sessionRow,
            status
        });

        const label = status === "present" ? "presente" : "ausente";
        showAlert(dom.markAlert, `Presenca registrada como ${label}.`, "success");
    } catch (error) {
        showAlert(dom.markAlert, error.message || "Falha ao registrar presenca.");
    }
}

function bindEvents() {
    dom.sessionSelect.addEventListener("change", () => {
        state.selectedSessionId = dom.sessionSelect.value;
    });

    dom.markPresent.addEventListener("click", () => submitAttendance("present"));
    dom.markAbsent.addEventListener("click", () => submitAttendance("absent"));
}

function setSessionUI(session) {
    const logged = Boolean(session);
    dom.userBadge.textContent = logged
        ? `${session.displayName} (${session.email})`
        : "sem sessao";

    dom.markPresent.disabled = !logged;
    dom.markAbsent.disabled = !logged;
    dom.sessionSelect.disabled = !logged || !state.sessions.some((item) => item.hasClass);
}

function initObservers() {
    if (state.unsubscribeSessions) {
        state.unsubscribeSessions();
    }
    state.unsubscribeSessions = subscribeClassSessions(
        (rows) => {
            state.sessions = rows;
            renderSessionOptions();
            setSessionUI(state.session);
        },
        (error) => {
            showAlert(
                dom.authAlert,
                error?.message?.includes("Missing or insufficient permissions")
                    ? "Permissao de leitura da agenda negada. Publique novamente o firestore.rules no Firebase."
                    : (error.message || "Falha ao carregar agenda de aulas.")
            );
        }
    );
}

function init() {
    bindEvents();

    if (!isFirebaseConfigured) {
        showAlert(dom.authAlert, "Configure o Firebase antes de usar a lista de presenca.");
        return;
    }

    initObservers();

    observeAuthSession((session) => {
        state.session = session;
        clearAlert(dom.authAlert);

        if (!session) {
            showAlert(dom.authAlert, "Entre na comunidade para marcar e visualizar sua presenca.");
            setSessionUI(null);
            renderAttendanceHistory([]);
            if (state.unsubscribeAttendance) {
                state.unsubscribeAttendance();
                state.unsubscribeAttendance = null;
            }
            return;
        }

        setSessionUI(session);

        if (state.unsubscribeAttendance) {
            state.unsubscribeAttendance();
        }

        state.unsubscribeAttendance = subscribeAttendanceByUser(
            session.uid,
            renderAttendanceHistory,
            (error) => {
                showAlert(dom.markAlert, error.message || "Falha ao carregar historico de presenca.");
            }
        );
    });
}

init();
