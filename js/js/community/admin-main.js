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

const state = {
    session: null,
    filter: "all",
    entries: [],
    selectedEntry: null,
    unsubscribeEntries: null,
    unsubscribeMessages: null
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
    chatBox: document.getElementById("selected-chat-box")
};

function syncSessionStorage(session) {
    if (!session) {
        localStorage.removeItem("communityRole");
        localStorage.removeItem("communityEmail");
        localStorage.removeItem("communityDisplayName");
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
    target.textContent = message;
    target.className = `community-alert ${type}`;
    target.style.display = "block";
}

function clearAlert(target) {
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

function statusLabel(status) {
    if (status === "resolved") {
        return "Resolvido";
    }
    if (status === "open") {
        return "Em andamento";
    }
    return "Novo";
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
            if (state.unsubscribeEntries) {
                state.unsubscribeEntries();
            }
            if (state.unsubscribeMessages) {
                state.unsubscribeMessages();
            }
            dom.adminUserBadge.textContent = "sem sessao admin";
            dom.adminEntries.innerHTML = '<div class="chat-empty">Sem permissao para visualizar entradas.</div>';
            dom.chatBox.innerHTML = '<div class="chat-empty">Sem permissao para visualizar conversas.</div>';
            return;
        }

        dom.adminUserBadge.textContent = `${session.displayName} (admin)`;
        watchEntries();
    });
}

init();
