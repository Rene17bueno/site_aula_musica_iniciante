import { isFirebaseConfigured } from "./firebase-client.js";
import {
    signUpWithEmail,
    signInWithEmail,
    observeAuthSession,
    logoutUser
} from "./auth-service.js";
import { submitVisitorEntry } from "./visitor-service.js";
import {
    sendChatMessage,
    subscribeAdminThreads,
    subscribeThreadMessages
} from "./chat-service.js";

const state = {
    authMode: "login",
    session: null,
    currentThreadId: null,
    unsubscribeMessages: null,
    unsubscribeThreads: null
};

const dom = {
    authAlert: document.getElementById("auth-alert"),
    visitorAlert: document.getElementById("visitor-alert"),
    chatAlert: document.getElementById("chat-alert"),
    authForm: document.getElementById("auth-form"),
    authSubmit: document.getElementById("auth-submit"),
    authModeLogin: document.getElementById("btn-auth-mode-login"),
    authModeSignup: document.getElementById("btn-auth-mode-signup"),
    displayNameGroup: document.getElementById("group-display-name"),
    displayNameInput: document.getElementById("display-name"),
    authEmail: document.getElementById("auth-email"),
    authPassword: document.getElementById("auth-password"),
    authSession: document.getElementById("auth-session"),
    sessionUser: document.getElementById("session-user"),
    logoutBtn: document.getElementById("logout-btn"),
    visitorForm: document.getElementById("visitor-form"),
    visitorName: document.getElementById("visitor-name"),
    visitorEmail: document.getElementById("visitor-email"),
    adminPanel: document.getElementById("admin-panel"),
    adminThreads: document.getElementById("admin-threads"),
    chatBox: document.getElementById("chat-box"),
    chatForm: document.getElementById("chat-form"),
    chatMessage: document.getElementById("chat-message"),
    chatFile: document.getElementById("chat-file")
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
    target.style.display = "none";
    target.className = "community-alert";
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

function setAuthMode(mode) {
    state.authMode = mode;

    const isSignup = mode === "signup";
    dom.displayNameGroup.style.display = isSignup ? "block" : "none";
    dom.authSubmit.textContent = isSignup ? "Cadastrar" : "Entrar";

    dom.authModeLogin.classList.toggle("ghost", mode !== "login");
    dom.authModeSignup.classList.toggle("ghost", mode !== "signup");

    clearAlert(dom.authAlert);
}

function setAuthenticatedUI(session) {
    const isAuthenticated = Boolean(session);

    dom.authForm.style.display = isAuthenticated ? "none" : "block";
    dom.authSession.style.display = isAuthenticated ? "block" : "none";
    dom.visitorForm.querySelectorAll("input, select, textarea, button").forEach((element) => {
        element.disabled = !isAuthenticated;
    });
    dom.chatForm.querySelectorAll("textarea, input, button").forEach((element) => {
        element.disabled = !isAuthenticated;
    });

    if (!isAuthenticated) {
        dom.authForm.reset();
        dom.authEmail.value = "";
        dom.authPassword.value = "";
        dom.displayNameInput.value = "";
        dom.sessionUser.textContent = "";
        dom.visitorName.value = "";
        dom.visitorEmail.value = "";
        dom.chatBox.innerHTML = '<div class="chat-empty">Entre para carregar as mensagens.</div>';
    }
}

function renderThreads(threads) {
    if (!threads.length) {
        dom.adminThreads.innerHTML = '<div class="chat-empty">Sem conversas iniciadas.</div>';
        return;
    }

    dom.adminThreads.innerHTML = threads
        .map((thread) => {
            const isActive = thread.id === state.currentThreadId ? "active" : "";
            const title = escapeHtml(thread.userName || thread.userEmail || thread.id);
            const preview = escapeHtml(thread.lastMessagePreview || "Sem mensagens");
            return `
                <button type="button" class="chat-thread-item ${isActive}" data-thread-id="${thread.id}">
                    <strong>${title}</strong>
                    <div class="community-muted">${preview}</div>
                </button>
            `;
        })
        .join("");
}

function renderMessages(messages) {
    if (!messages.length) {
        dom.chatBox.innerHTML = '<div class="chat-empty">Sem mensagens ainda.</div>';
        return;
    }

    dom.chatBox.innerHTML = messages
        .map((message) => {
            const isAdmin = message.senderRole === "admin";
            const attachment = message.attachment;
            let attachmentHtml = "";

            if (attachment?.url && attachment?.kind === "image") {
                attachmentHtml = `<div class="chat-attachment"><img src="${attachment.url}" alt="${escapeHtml(attachment.name || "Imagem")}" loading="lazy" /></div>`;
            }

            if (attachment?.url && attachment?.kind === "video") {
                attachmentHtml = `<div class="chat-attachment"><video controls preload="metadata"><source src="${attachment.url}" type="${escapeHtml(attachment.mimeType || "video/mp4")}" /></video></div>`;
            }

            return `
                <article class="chat-message ${isAdmin ? "admin" : ""}">
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

function stopMessageSubscription() {
    if (state.unsubscribeMessages) {
        state.unsubscribeMessages();
        state.unsubscribeMessages = null;
    }
}

function openThread(threadId) {
    state.currentThreadId = threadId;
    stopMessageSubscription();

    state.unsubscribeMessages = subscribeThreadMessages(threadId, (messages) => {
        renderMessages(messages);
    });
}

function stopAdminThreadSubscription() {
    if (state.unsubscribeThreads) {
        state.unsubscribeThreads();
        state.unsubscribeThreads = null;
    }
}

function handleSession(session) {
    state.session = session;
    syncSessionStorage(session);
    setAuthenticatedUI(session);

    stopMessageSubscription();
    stopAdminThreadSubscription();

    if (!session) {
        state.currentThreadId = null;
        dom.adminPanel.style.display = "none";
        clearAlert(dom.visitorAlert);
        clearAlert(dom.chatAlert);
        return;
    }

    dom.sessionUser.textContent = `${session.displayName} (${session.role})`;
    dom.visitorName.value = session.displayName || "";
    dom.visitorEmail.value = session.email || "";

    if (session.role === "admin") {
        dom.adminPanel.style.display = "block";
        state.unsubscribeThreads = subscribeAdminThreads((threads) => {
            renderThreads(threads);
            if (!state.currentThreadId && threads.length) {
                openThread(threads[0].id);
            }
        });
    } else {
        dom.adminPanel.style.display = "none";
        openThread(session.uid);
    }
}

function bindEvents() {
    dom.authModeLogin.addEventListener("click", () => setAuthMode("login"));
    dom.authModeSignup.addEventListener("click", () => setAuthMode("signup"));

    dom.authForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearAlert(dom.authAlert);

        if (!isFirebaseConfigured) {
            showAlert(dom.authAlert, "Configure o Firebase em js/js/community/firebase-config.js.");
            return;
        }

        const formData = new FormData(dom.authForm);
        const payload = {
            name: String(formData.get("displayName") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || "")
        };

        try {
            if (state.authMode === "signup") {
                if (!payload.name) {
                    throw new Error("Informe seu nome para criar a conta.");
                }
                await signUpWithEmail(payload);
                showAlert(dom.authAlert, "Conta criada com sucesso.", "success");
            } else {
                await signInWithEmail(payload);
                showAlert(dom.authAlert, "Login realizado com sucesso.", "success");
            }
            dom.authForm.reset();
        } catch (error) {
            showAlert(dom.authAlert, error.message || "Falha na autenticacao.");
        }
    });

    dom.logoutBtn.addEventListener("click", async () => {
        try {
            await logoutUser();
            dom.authForm.reset();
            dom.authEmail.value = "";
            dom.authPassword.value = "";
            dom.displayNameInput.value = "";
            clearAlert(dom.chatAlert);
            showAlert(dom.authAlert, "Sessao encerrada com sucesso.", "success");
        } catch (error) {
            showAlert(dom.authAlert, error.message || "Erro ao encerrar sessao.");
        }
    });

    dom.visitorForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearAlert(dom.visitorAlert);

        if (!state.session) {
            showAlert(dom.visitorAlert, "Faca login para enviar o formulario.");
            return;
        }

        const formData = new FormData(dom.visitorForm);
        const payload = {
            user: state.session,
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            topic: String(formData.get("topic") || "").trim(),
            message: String(formData.get("message") || "").trim()
        };

        try {
            await submitVisitorEntry(payload);
            showAlert(dom.visitorAlert, "Formulario enviado com sucesso.", "success");
            dom.visitorForm.reset();
            dom.visitorName.value = state.session.displayName || "";
            dom.visitorEmail.value = state.session.email || "";
        } catch (error) {
            showAlert(dom.visitorAlert, error.message || "Falha no envio do formulario.");
        }
    });

    dom.adminThreads.addEventListener("click", (event) => {
        const target = event.target.closest("[data-thread-id]");
        if (!target) {
            return;
        }
        const threadId = target.getAttribute("data-thread-id");
        if (!threadId) {
            return;
        }
        openThread(threadId);
    });

    dom.chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearAlert(dom.chatAlert);

        if (!state.session) {
            showAlert(dom.chatAlert, "Faca login para usar o chat.");
            return;
        }

        const threadId = state.session.role === "admin" ? state.currentThreadId : state.session.uid;
        const text = dom.chatMessage.value;
        const file = dom.chatFile.files?.[0] || null;

        try {
            await sendChatMessage({
                threadId,
                sender: state.session,
                text,
                file
            });

            dom.chatMessage.value = "";
            dom.chatFile.value = "";
            showAlert(dom.chatAlert, "Mensagem enviada.", "success");
        } catch (error) {
            showAlert(dom.chatAlert, error.message || "Falha ao enviar mensagem.");
        }
    });
}

function init() {
    setAuthMode("login");
    bindEvents();

    if (!isFirebaseConfigured) {
        showAlert(dom.authAlert, "Preencha as chaves em js/js/community/firebase-config.js antes de testar.");
    }

    observeAuthSession(handleSession);
}

init();
