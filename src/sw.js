import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

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

    event.waitUntil(self.registration.showNotification(notification.title || "Worship Helper", {
        body: notification.body || "Voce tem uma nova atualizacao.",
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        tag: notification.tag,
        renotify: Boolean(notification.tag),
        data: {
            url: notification.url || "/home"
        }
    }));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const destination = new URL(event.notification.data.url, self.location.origin).href;

    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });
        const client = windows.find((current) => current.url.startsWith(self.location.origin));

        if (client) {
            await client.focus();
            return client.navigate(destination);
        }

        return self.clients.openWindow(destination);
    })());
});
