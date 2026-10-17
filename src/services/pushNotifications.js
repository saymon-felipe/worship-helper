import api from "../config/api";
import { isIOSDevice, isPwaInstalled } from "./pwaInstall";

const PROMPT_DISMISSED_KEY = "push-notifications-dismissed";
const SERVICE_WORKER_TIMEOUT = 10000;
// Mesmo nome usado em sw.js: o clique na notificacao deixa o destino aqui quando o app ainda nao esta aberto.
const PENDING_NAVIGATION_CACHE = "wh-notification-navigation";
const PENDING_NAVIGATION_KEY = "/__wh-pending-notification-navigation";
const PENDING_NAVIGATION_MAX_AGE = 2 * 60 * 1000;

let publicKeyPromise = null;

function isPushSupported() {
    return typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);

    return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

function withTimeout(promise, ms, message) {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error(message)), ms);
        promise.then((value) => {
            window.clearTimeout(timer);
            resolve(value);
        }, (error) => {
            window.clearTimeout(timer);
            reject(error);
        });
    });
}

// Sem service worker ativo o ready nunca resolve; o timeout evita o botao preso em "ativando".
function getServiceWorkerRegistration() {
    return withTimeout(
        navigator.serviceWorker.ready,
        SERVICE_WORKER_TIMEOUT,
        "O serviço de notificações do app ainda não está pronto. Feche e abra o app e tente novamente."
    );
}

function getPublicKey() {
    if (!publicKeyPromise) {
        publicKeyPromise = api.get("/usuario/push/public-key")
            .then((response) => {
                const publicKey = response.data && response.data.returnObj && response.data.returnObj.publicKey;
                if (!publicKey) {
                    throw new Error("A chave de notificacoes nao esta disponivel.");
                }
                return publicKey;
            })
            .catch((error) => {
                publicKeyPromise = null;
                throw error;
            });
    }

    return publicKeyPromise;
}

export function getPushPermission() {
    return isPushSupported() ? Notification.permission : "unsupported";
}

// Adianta chave e service worker antes do toque: no iOS, quanto menos espera entre a permissao e o subscribe, melhor.
export function preparePushSubscription() {
    if (!isPushSupported()) {
        return;
    }

    getPublicKey().catch(() => {});
    getServiceWorkerRegistration().catch(() => {});
}

async function subscribe(registration) {
    const publicKey = await getPublicKey();

    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
}

function saveSubscription(subscription) {
    return api.post("/usuario/push/subscription", {
        subscription: subscription.toJSON()
    });
}

export async function syncPushSubscription() {
    if (!isPushSupported() || Notification.permission !== "granted") {
        return null;
    }

    const registration = await getServiceWorkerRegistration();
    let subscription = await registration.pushManager.getSubscription() || await subscribe(registration);

    try {
        await saveSubscription(subscription);
    } catch (error) {
        // 410: o servico de push (comum no iOS) ja recusou esta assinatura, mas o navegador continua devolvendo ela.
        // Troca por uma nova uma vez so; com a permissao concedida o subscribe nao precisa de toque do usuario.
        if (!error.response || error.response.status !== 410) {
            throw error;
        }

        await subscription.unsubscribe();
        subscription = await subscribe(registration);
        await saveSubscription(subscription);
    }

    return subscription;
}

async function subscribeAndConfirm() {
    const subscription = await syncPushSubscription();
    if (subscription) {
        // Notificacao de confirmacao: mostra na hora, no proprio aparelho, que o envio funciona.
        api.post("/usuario/push/test", { endpoint: subscription.endpoint }).catch((error) => {
            console.error("[Push] Nao foi possivel enviar a notificacao de confirmacao:", error.message);
        });
    }
    return subscription;
}

export async function requestPushPermission() {
    if (!isPushSupported()) {
        return "unsupported";
    }

    // iOS so mostra o pedido de permissao se a chamada sair direto do toque do usuario: nada de await antes daqui.
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        return permission;
    }

    await subscribeAndConfirm();
    return permission;
}

// Para quem liberou pelos ajustes do sistema depois de ter bloqueado: a permissao ja veio, falta assinar.
export async function confirmGrantedPushPermission() {
    if (getPushPermission() !== "granted") {
        return false;
    }

    await subscribeAndConfirm();
    return true;
}

export async function removePushSubscription(authToken) {
    if (!isPushSupported()) {
        return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        return;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        return;
    }

    await api.post("/usuario/push/unsubscribe", {
        endpoint: subscription.endpoint
    }, authToken ? {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    } : undefined);
}

export function getIOSVersion() {
    const match = window.navigator.userAgent.match(/OS (\d+)[_.](\d+)/);
    return match ? { major: Number(match[1]), minor: Number(match[2]) } : null;
}

/**
 * Motivo para exibir o aviso de notificacoes, ou null quando nao ha o que pedir.
 * So vale para o app instalado (no iOS o push nem existe fora da Tela de Inicio).
 */
export function getPushPromptReason() {
    if (!isPwaInstalled()) {
        return null;
    }

    const permission = getPushPermission();
    if (permission === "default" || permission === "denied") {
        return permission;
    }

    // Sem suporte no app instalado so tem solucao no iPhone/iPad antigo (push chegou no iOS 16.4).
    if (permission === "unsupported" && isIOSDevice()) {
        return "unsupported";
    }

    return null;
}

export function isPushPromptDismissed() {
    try {
        return sessionStorage.getItem(PROMPT_DISMISSED_KEY) === "true";
    } catch (error) {
        return false;
    }
}

export function dismissPushPrompt() {
    try {
        sessionStorage.setItem(PROMPT_DISMISSED_KEY, "true");
    } catch (error) {
        // Sem sessionStorage o aviso so volta na proxima abertura do app.
    }
}

export function resetPushPromptDismissal() {
    try {
        sessionStorage.removeItem(PROMPT_DISMISSED_KEY);
    } catch (error) {
        // Nada a limpar.
    }
}

function toAppPath(url) {
    try {
        const destination = new URL(url, window.location.origin);
        return destination.origin === window.location.origin
            ? destination.pathname + destination.search + destination.hash
            : null;
    } catch (error) {
        return null;
    }
}

async function clearPendingNotificationNavigation() {
    if (!("caches" in window)) return;
    const cache = await caches.open(PENDING_NAVIGATION_CACHE);
    await cache.delete(PENDING_NAVIGATION_KEY);
}

async function consumePendingNotificationNavigation() {
    if (!("caches" in window)) return null;

    const cache = await caches.open(PENDING_NAVIGATION_CACHE);
    const response = await cache.match(PENDING_NAVIGATION_KEY);
    if (!response) return null;

    await cache.delete(PENDING_NAVIGATION_KEY);
    const pending = await response.json();
    return pending && Date.now() - pending.createdAt <= PENDING_NAVIGATION_MAX_AGE ? pending.url : null;
}

/**
 * Leva o app para a tela da notificacao tocada. O service worker avisa por mensagem quando o app ja esta aberto
 * e deixa o destino no cache quando precisa abrir o app (no iOS o openWindow pode abrir na raiz e o navigate falha).
 */
export function setupNotificationNavigation(router) {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
        return;
    }

    const goTo = (url) => {
        const path = toAppPath(url);
        if (path && router.currentRoute.value.fullPath !== path) {
            router.push(path);
        }
    };

    navigator.serviceWorker.addEventListener("message", (event) => {
        if (!event.data || event.data.type !== "notification-click") return;
        clearPendingNotificationNavigation().catch(() => {});
        goTo(event.data.url);
    });
    navigator.serviceWorker.startMessages();

    consumePendingNotificationNavigation()
        .then((url) => url && goTo(url))
        .catch(() => {});
}
