import api from "../config/api";

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

export function getPushPermission() {
    return isPushSupported() ? Notification.permission : "unsupported";
}

export async function syncPushSubscription() {
    if (!isPushSupported() || Notification.permission !== "granted") {
        return false;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        const response = await api.get("/usuario/push/public-key");
        const publicKey = response.data && response.data.returnObj && response.data.returnObj.publicKey;

        if (!publicKey) {
            throw new Error("A chave de notificacoes nao esta disponivel.");
        }

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
    }

    await api.post("/usuario/push/subscription", {
        subscription: subscription.toJSON()
    });

    return true;
}

export async function requestPushPermission() {
    if (!isPushSupported()) {
        return "unsupported";
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        return permission;
    }

    await syncPushSubscription();
    return permission;
}

export async function removePushSubscription() {
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
    });
}
