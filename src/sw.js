import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// Mesmos nomes de services/pushNotifications.js, que le o destino pendente quando o app abre.
const PENDING_NAVIGATION_CACHE = "wh-notification-navigation";
const PENDING_NAVIGATION_KEY = "/__wh-pending-notification-navigation";

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
    let notification = {};

    try {
        notification = event.data ? event.data.json() : {};
    } catch (error) {
        notification = { body: event.data ? event.data.text() : "" };
    }

    // Todo push precisa virar notificacao visivel: o iOS cancela a assinatura de quem recebe push silencioso.
    event.waitUntil(self.registration.showNotification(notification.title || "Worship Helper", {
        body: notification.body || "Voce tem uma nova atualizacao.",
        icon: "/pwa-192x192.png",
        // O Android usa so a transparencia do badge na barra de status; o icone colorido virava um quadrado branco.
        badge: "/notification-badge.png",
        tag: notification.tag,
        renotify: Boolean(notification.tag),
        data: {
            url: notification.url || "/home"
        }
    }));
});

async function savePendingNavigation(url) {
    const cache = await caches.open(PENDING_NAVIGATION_CACHE);
    await cache.put(PENDING_NAVIGATION_KEY, new Response(JSON.stringify({ url, createdAt: Date.now() }), {
        headers: { "Content-Type": "application/json" }
    }));
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const destination = new URL((event.notification.data && event.notification.data.url) || "/home", self.location.origin).href;

    event.waitUntil((async () => {
        // O app le este destino ao abrir: no iOS o openWindow pode abrir o app na raiz em vez da URL pedida.
        await savePendingNavigation(destination).catch(() => {});

        const windows = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });
        const client = windows.find((current) => current.url.startsWith(self.location.origin));

        if (client) {
            // client.navigate falha no iOS ("navigate failed"); o proprio app troca de tela pelo router.
            await client.focus().catch(() => {});
            client.postMessage({ type: "notification-click", url: destination });
            return;
        }

        await self.clients.openWindow(destination);
    })());
});
