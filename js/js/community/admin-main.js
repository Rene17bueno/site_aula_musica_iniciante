import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, isFirebaseConfigured } from "./firebase-client.js";
import { observeAuthSession } from "./auth-service.js";
import { sendChatMessage, subscribeThreadMessages } from "./chat-service.js";
import {
    subscribeAttendanceBySession,
    subscribeClassSessions,
    upsertClassSession
} from "./attendance-service.js";

const SUPPORT_WHATSAPP = "5544991379447";
// Configure um webhook de automacao (n8n/Make/Zapier/Cloud Function)
// para envio automatico sem abrir o WhatsApp Web.
const WHATSAPP_AUTOMATION_WEBHOOK = "https://SEU-WEBHOOK-RENDER.onrender.com/send-class-notice";
const WHATSAPP_AUTOMATION_KEY = "";

const state = {
    session: null,
    filter: "all",
    entries: [],
    selectedEntry: null,
    unsubscribeEntries: null,
    unsubscribeMessages: null,
    unsubscribeClassSessions: null,
    unsubscribeAttendanceBySession: null,
    classSessions: [],
    selectedClassSessionId: ""
};

const dom = {
    adminAuthAlert: document.getElementById("admin-auth-alert"),
    adminUserBadge: document.getElementById("admin-user-badge"),
    adminEntries: document.getElementById("admin-entries"),
    filters: Array.from(document.querySelectorAll(".admin-filter")),
    quickReplyTemplate: document.getElementById("quick-reply-template"),
    replyText: document.getElementById("reply-text"),
    replyFile: document.getElementById("reply-file"),
    replyAlert: document.getElementById("reply-alert"),
    sendReply: document.getElementById("btn-send-reply"),
    markOpen: document.getElementById("btn-mark-open"),
    markResolved: document.getElementById("btn-mark-resolved"),
    chatBox: document.getElementById("selected-chat-box"),
    attendanceAdminAlert: document.getElementById("attendance-admin-alert"),
    classDate: document.getElementById("class-date"),
    classWeekday: document.getElementById("class-weekday"),
    classHasClass: document.getElementById("class-has-class"),
    classNote: document.getElementById("class-note"),
    saveClassBtn: document.getElementById("btn-save-class"),
    sendWhatsappInfoBtn: document.getElementById("btn-send-whatsapp-info"),
    attendanceSessionFilter: document.getElementById("attendance-session-filter"),
    attendanceAdminBody: document.getElementById("attendance-admin-body")
};

function syncSessionStorage(session) {
    if (!session) {
        localStorage.removeItem("communityRole");
        localStorage.removeItem("communityEmail");
        localStorage.removeItem("communityDisplayName");
        if (typeof window.refreshAdminNavVisibility === "function") {
            window.refreshAdminNavVisibility();
        }
        return;
    }

    localStorage.setItem("communityRole", String(session.role || "user"));
    localStorage.setItem("communityEmail", String(session.email || ""));
    localStorage.setItem("communityDisplayName", String(session.displayName || ""));

    if (typeof window.refreshAdminNavVisibility === "function") {
        window.refreshAdminNavVisibility();
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

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
        return "agora";
    }
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(date);
}

function formatClassDate(value) {
    if (!value) {
        return "-";
    }
    const [y, m, d] = String(value).split("-");
    if (!y || !m || !d) {
        return value;
    }
    return `${d}/${m}/${y}`;
}

function statusLabel(status) {
    if (status === "resolved") {
        return "Resolvido";
    }
    if (status === "open") {
        return "Em andamento";
    }
    return "Novo";
}

function attendanceStatusLabel(status) {
    if (status === "present") {
        return "Presente";
    }
    if (status === "absent") {
        return "Ausente";
    }
    return "-";
}

function renderEntries() {
    const filtered = state.entries.filter((entry) => {
        if (state.filter === "all") {
            return true;
        }
        return (entry.status || "new") === state.filter;
    });

    if (!filtered.length) {
        dom.adminEntries.innerHTML = '<div class="chat-empty">Nenhuma entrada para o filtro atual.</div>';
        return;
    }

    dom.adminEntries.innerHTML = filtered
        .map((entry) => {
            const active = state.selectedEntry?.id === entry.id ? "active" : "";
            const safeStatus = entry.status || "new";
            return `
                <article class="admin-entry-item ${active}" data-entry-id="${entry.id}">
                    <div class="admin-entry-head">
                        <span class="admin-entry-title">${escapeHtml(entry.name || "Visitante")}</span>
                        <span class="status-pill ${safeStatus}">${statusLabel(safeStatus)}</span>
                    </div>
                    <div class="admin-entry-meta">${escapeHtml(entry.email || "sem email")} · ${escapeHtml(entry.topic || "sem assunto")}</div>
                    <div class="community-muted">${escapeHtml((entry.message || "").slice(0, 140))}</div>
                </article>
            `;
        })
        .join("");
}

function renderMessages(messages) {
    if (!messages.length) {
        dom.chatBox.innerHTML = '<div class="chat-empty">Sem mensagens nesta conversa.</div>';
        return;
    }

    dom.chatBox.innerHTML = messages
        .map((message) => {
            const adminClass = message.senderRole === "admin" ? "admin" : "";
            let attachmentHtml = "";

            if (message.attachment?.url && message.attachment?.kind === "image") {
                attachmentHtml = `<div class="chat-attachment"><img src="${message.attachment.url}" alt="${escapeHtml(message.attachment.name || "Imagem")}" loading="lazy" /></div>`;
            }

            if (message.attachment?.url && message.attachment?.kind === "video") {
                attachmentHtml = `<div class="chat-attachment"><video controls preload="metadata"><source src="${message.attachment.url}" type="${escapeHtml(message.attachment.mimeType || "video/mp4")}" /></video></div>`;
            }

            return `
                <article class="chat-message ${adminClass}">
                    <div class="chat-meta">
                        <span>${escapeHtml(message.senderName || "Usuario")}</span>
                        <span>${formatTimestamp(message.createdAt)}</span>
                    </div>
                    <div>${escapeHtml(message.text || "")}</div>
                    ${attachmentHtml}
                </article>
            `;
        })
        .join("");

    dom.chatBox.scrollTop = dom.chatBox.scrollHeight;
}

function renderAttendanceSessionFilter() {
    if (!dom.attendanceSessionFilter) {
        return;
    }

    if (!state.classSessions.length) {
        dom.attendanceSessionFilter.innerHTML = '<option value="">Sem aulas configuradas</option>';
        state.selectedClassSessionId = "";
        renderAttendanceTable([]);
        return;
    }

    if (!state.selectedClassSessionId || !state.classSessions.some((item) => item.id === state.selectedClassSessionId)) {
        state.selectedClassSessionId = state.classSessions[0].id;
    }

    dom.attendanceSessionFilter.innerHTML = state.classSessions
        .map((item) => {
            const status = item.hasClass ? "Aula confirmada" : "Sem aula";
            const selected = item.id === state.selectedClassSessionId ? "selected" : "";
            return `<option value="${item.id}" ${selected}>${formatClassDate(item.classDate)} · ${item.weekday || "Dia nao informado"} · ${status}</option>`;
        })
        .join("");

    subscribeAttendanceForSelectedSession();
}

function renderAttendanceTable(rows) {
    if (!dom.attendanceAdminBody) {
        return;
    }

    if (!rows.length) {
        dom.attendanceAdminBody.innerHTML = '<tr><td colspan="6" class="attendance-empty">Sem registros de presenca para esta aula.</td></tr>';
        return;
    }

    dom.attendanceAdminBody.innerHTML = rows
        .map((item) => `
            <tr>
                <td>${escapeHtml(item.studentName || "Aluno")}</td>
                <td>${escapeHtml(item.studentEmail || "-")}</td>
                <td>${formatClassDate(item.classDate)}</td>
                <td>${escapeHtml(item.weekday || "-")}</td>
                <td>${attendanceStatusLabel(item.status)}</td>
                <td>${formatTimestamp(item.updatedAt || item.markedAt)}</td>
            </tr>
        `)
        .join("");
}

function selectedClassSession() {
    return state.classSessions.find((item) => item.id === state.selectedClassSessionId) || null;
}

function openEntry(entryId) {
    state.selectedEntry = state.entries.find((item) => item.id === entryId) || null;
    renderEntries();

    if (state.unsubscribeMessages) {
        state.unsubscribeMessages();
        state.unsubscribeMessages = null;
    }

    if (!state.selectedEntry?.uid) {
        dom.chatBox.innerHTML = '<div class="chat-empty">A entrada selecionada nao possui UID valido.</div>';
        return;
    }

    state.unsubscribeMessages = subscribeThreadMessages(state.selectedEntry.uid, renderMessages);
}

async function updateEntryStatus(nextStatus) {
    if (!state.selectedEntry) {
        showAlert(dom.replyAlert, "Selecione uma entrada antes de mudar status.");
        return;
    }

    await updateDoc(doc(db, "visitorEntries", state.selectedEntry.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        updatedBy: state.session.uid
    });

    showAlert(dom.replyAlert, `Status alterado para ${statusLabel(nextStatus).toLowerCase()}.`, "success");
}

function watchEntries() {
    if (state.unsubscribeEntries) {
        state.unsubscribeEntries();
        state.unsubscribeEntries = null;
    }

    const entriesQuery = query(collection(db, "visitorEntries"), orderBy("createdAt", "desc"));
    state.unsubscribeEntries = onSnapshot(entriesQuery, (snapshot) => {
        state.entries = snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));

        const selectedId = state.selectedEntry?.id;
        if (selectedId && !state.entries.some((item) => item.id === selectedId)) {
            state.selectedEntry = null;
        }

        renderEntries();
    });
}

function watchClassSessions() {
    if (state.unsubscribeClassSessions) {
        state.unsubscribeClassSessions();
        state.unsubscribeClassSessions = null;
    }

    state.unsubscribeClassSessions = subscribeClassSessions((rows) => {
        state.classSessions = rows;
        renderAttendanceSessionFilter();
    });
}

function subscribeAttendanceForSelectedSession() {
    if (state.unsubscribeAttendanceBySession) {
        state.unsubscribeAttendanceBySession();
        state.unsubscribeAttendanceBySession = null;
    }

    if (!state.selectedClassSessionId) {
        renderAttendanceTable([]);
        return;
    }

    state.unsubscribeAttendanceBySession = subscribeAttendanceBySession(state.selectedClassSessionId, renderAttendanceTable);
}

async function saveClassSetup() {
    clearAlert(dom.attendanceAdminAlert);

    const classDate = dom.classDate.value;
    const weekday = dom.classWeekday.value;
    const hasClass = dom.classHasClass.value === "yes";
    const note = dom.classNote.value.trim();

    if (!classDate || !weekday) {
        showAlert(dom.attendanceAdminAlert, "Preencha data e dia da semana para salvar a aula.");
        return;
    }

    await upsertClassSession({
        classDate,
        weekday,
        hasClass,
        note,
        updatedBy: state.session.uid
    });

    state.selectedClassSessionId = classDate;
    showAlert(dom.attendanceAdminAlert, "Configuracao de aula salva com sucesso.", "success");
}

async function sendWhatsappClassInfo() {
    clearAlert(dom.attendanceAdminAlert);

    const classDate = dom.classDate.value;
    const weekday = dom.classWeekday.value;
    const hasClass = dom.classHasClass.value === "yes";
    const note = dom.classNote.value.trim();

    if (!classDate || !weekday) {
        showAlert(dom.attendanceAdminAlert, "Preencha data e dia para gerar o informativo.");
        return;
    }

    const classStatus = hasClass ? "CONFIRMADA" : "CANCELADA";
    const text = [
        "Comunicado de Aula",
        `Data: ${formatClassDate(classDate)}`,
        `Dia: ${weekday}`,
        `Status: ${classStatus}`,
        note ? `Observacao: ${note}` : ""
    ].filter(Boolean).join("\n");

    const webhookLooksConfigured =
        WHATSAPP_AUTOMATION_WEBHOOK &&
        !WHATSAPP_AUTOMATION_WEBHOOK.includes("SEU-WEBHOOK") &&
        WHATSAPP_AUTOMATION_WEBHOOK.startsWith("https://");

    if (webhookLooksConfigured) {
        const payload = {
            to: SUPPORT_WHATSAPP,
            message: text,
            classDate,
            weekday,
            hasClass,
            note,
            sentByUid: state.session?.uid || ""
        };

        const headers = {
            "Content-Type": "application/json"
        };

        if (WHATSAPP_AUTOMATION_KEY) {
            headers["x-webhook-key"] = WHATSAPP_AUTOMATION_KEY;
        }

        return fetch(WHATSAPP_AUTOMATION_WEBHOOK, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        })
            .then(async (response) => {
                if (!response.ok) {
                    const body = await response.text();
                    throw new Error(body || "Falha no envio automatico via webhook.");
                }
                showAlert(dom.attendanceAdminAlert, "Informativo enviado automaticamente por WhatsApp.", "success");
            })
            .catch((error) => {
                showAlert(dom.attendanceAdminAlert, error.message || "Falha no envio automatico por WhatsApp.");
            });
    }

    if (WHATSAPP_AUTOMATION_WEBHOOK && !webhookLooksConfigured) {
        showAlert(
            dom.attendanceAdminAlert,
            "Webhook com placeholder. Atualize WHATSAPP_AUTOMATION_WEBHOOK com a URL real do Render e tente novamente."
        );
        return;
    }

    const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
    showAlert(dom.attendanceAdminAlert, "Webhook nao configurado: abrimos o WhatsApp com a mensagem pronta.", "success");
}

async function sendQuickReply() {
    clearAlert(dom.replyAlert);

    if (!state.selectedEntry) {
        showAlert(dom.replyAlert, "Selecione uma entrada para responder.");
        return;
    }

    const threadId = state.selectedEntry.uid;
    const text = dom.replyText.value.trim();
    const file = dom.replyFile.files?.[0] || null;

    await sendChatMessage({
        threadId,
        sender: state.session,
        text,
        file
    });

    dom.replyText.value = "";
    dom.replyFile.value = "";
    showAlert(dom.replyAlert, "Resposta enviada no chat do usuario.", "success");
}

function bindEvents() {
    dom.filters.forEach((button) => {
        button.addEventListener("click", () => {
            dom.filters.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            state.filter = button.getAttribute("data-filter") || "all";
            renderEntries();
        });
    });

    dom.quickReplyTemplate.addEventListener("change", () => {
        const text = dom.quickReplyTemplate.value;
        if (!text) {
            return;
        }
        dom.replyText.value = text;
    });

    dom.adminEntries.addEventListener("click", (event) => {
        const target = event.target.closest("[data-entry-id]");
        if (!target) {
            return;
        }
        const entryId = target.getAttribute("data-entry-id");
        if (entryId) {
            openEntry(entryId);
        }
    });

    dom.sendReply.addEventListener("click", async () => {
        try {
            await sendQuickReply();
        } catch (error) {
            showAlert(dom.replyAlert, error.message || "Falha ao enviar resposta.");
        }
    });

    dom.markOpen.addEventListener("click", async () => {
        try {
            await updateEntryStatus("open");
        } catch (error) {
            showAlert(dom.replyAlert, error.message || "Falha ao atualizar status.");
        }
    });

    dom.markResolved.addEventListener("click", async () => {
        try {
            await updateEntryStatus("resolved");
        } catch (error) {
            showAlert(dom.replyAlert, error.message || "Falha ao atualizar status.");
        }
    });

    dom.saveClassBtn.addEventListener("click", async () => {
        try {
            await saveClassSetup();
        } catch (error) {
            showAlert(dom.attendanceAdminAlert, error.message || "Falha ao salvar configuracao da aula.");
        }
    });

    dom.sendWhatsappInfoBtn.addEventListener("click", sendWhatsappClassInfo);

    dom.attendanceSessionFilter.addEventListener("change", () => {
        state.selectedClassSessionId = dom.attendanceSessionFilter.value;
        subscribeAttendanceForSelectedSession();

        const current = selectedClassSession();
        if (current) {
            dom.classDate.value = current.classDate || "";
            dom.classWeekday.value = current.weekday || "";
            dom.classHasClass.value = current.hasClass ? "yes" : "no";
            dom.classNote.value = current.note || "";
        }
    });
}

function validateAdminSession(session) {
    if (!session) {
        showAlert(dom.adminAuthAlert, "Voce precisa entrar para acessar o painel admin.");
        return false;
    }

    if (session.role !== "admin") {
        showAlert(dom.adminAuthAlert, "Acesso negado: seu usuario nao possui role admin.");
        return false;
    }

    clearAlert(dom.adminAuthAlert);
    return true;
}

function clearAdminState() {
    if (state.unsubscribeEntries) {
        state.unsubscribeEntries();
        state.unsubscribeEntries = null;
    }

    if (state.unsubscribeMessages) {
        state.unsubscribeMessages();
        state.unsubscribeMessages = null;
    }

    if (state.unsubscribeClassSessions) {
        state.unsubscribeClassSessions();
        state.unsubscribeClassSessions = null;
    }

    if (state.unsubscribeAttendanceBySession) {
        state.unsubscribeAttendanceBySession();
        state.unsubscribeAttendanceBySession = null;
    }

    dom.adminUserBadge.textContent = "sem sessao admin";
    dom.adminEntries.innerHTML = '<div class="chat-empty">Sem permissao para visualizar entradas.</div>';
    dom.chatBox.innerHTML = '<div class="chat-empty">Sem permissao para visualizar conversas.</div>';
    renderAttendanceTable([]);
}

function init() {
    if (!isFirebaseConfigured) {
        showAlert(dom.adminAuthAlert, "Configure o Firebase em js/js/community/firebase-config.js.");
        return;
    }

    bindEvents();

    observeAuthSession((session) => {
        state.session = session;
        syncSessionStorage(session);

        if (!validateAdminSession(session)) {
            clearAdminState();
            return;
        }

        dom.adminUserBadge.textContent = `${session.displayName} (admin)`;
        watchEntries();
        watchClassSessions();
    });
}

init();
