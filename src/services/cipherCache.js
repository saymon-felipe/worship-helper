const CACHE_NAME = "worship-helper-ciphers-v1";

function requestFor(churchId, musicId) {
    return new Request(`/__cipher-cache__/${churchId}/${musicId}`);
}

export async function getCachedCipher(churchId, musicId, version) {
    if (!("caches" in window) || !churchId || !musicId || !version) return null;
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(requestFor(churchId, musicId));
    if (!response) return null;

    const cached = await response.json();
    return cached.version === version ? cached : null;
}

export async function cacheCipher(churchId, musicId, version, text, title = "") {
    if (!("caches" in window) || !churchId || !musicId || !version) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
        requestFor(churchId, musicId),
        new Response(JSON.stringify({ version, text, title }), {
            headers: { "Content-Type": "application/json" }
        })
    );
}

export async function clearCachedCipher(churchId, musicId) {
    if (!("caches" in window) || !churchId || !musicId) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(requestFor(churchId, musicId));
}
