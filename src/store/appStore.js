import { reactive } from "vue";
const authStorageKey = "wh_jwt";
const state = reactive({
    auth: {
        token: localStorage.getItem(authStorageKey),
        claims: null,
        isAppAdmin: false,
        refreshed: false
    },
    user: null,
    church: null,
    churchPermission: {
        administrador: false,
        apenas_membro: false
    },
    loadingApp: true,
    imageCache: new Map()
});
function decodeToken(token) {
    if (!token) {
        return null;
    }
    try {
        const payload = token.split(".")[1];
        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
        const json = decodeURIComponent(
            atob(padded)
                .split("")
                .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}
function isTokenValid(token) {
    const claims = decodeToken(token);
    if (!claims || !claims.exp) {
        return false;
    }
    return claims.exp * 1000 > Date.now();
}
function preloadImage(url) {
    if (!url || state.imageCache.has(url)) {
        return;
    }
    const image = new Image();
    image.src = url;
    state.imageCache.set(url, image);
}
function preloadChurchImages(church) {
    if (!church) {
        return;
    }
    preloadImage(church.imagem_igreja);
    const members = Array.isArray(church.membros) ? church.membros : [];
    members.forEach((member) => preloadImage(member.imagem_usuario));
}
function preloadUserImages(user) {
    if (!user) {
        return;
    }
    preloadImage(user.imagem_usuario);
}
function setToken(token, refreshed = true) {
    state.auth.token = token;
    state.auth.claims = decodeToken(token);
    state.auth.isAppAdmin = Boolean(state.auth.claims && state.auth.claims.app_owner);
    state.auth.refreshed = Boolean(token && refreshed);
    if (token) {
        localStorage.setItem(authStorageKey, token);
    } else {
        localStorage.removeItem(authStorageKey);
    }
}
function clearAuth() {
    setToken(null);
    state.user = null;
    state.church = null;
    state.churchPermission = {
        administrador: false,
        apenas_membro: false
    };
}
function setUser(user) {
    state.user = user || null;
    preloadUserImages(state.user);
}
function setChurch(church) {
    state.church = church || null;
    preloadChurchImages(state.church);
}
function setChurchPermission(permission) {
    state.churchPermission = {
        administrador: Boolean(permission && permission.administrador),
        apenas_membro: Boolean(permission && permission.apenas_membro)
    };
}
setToken(state.auth.token, false);
export const appStore = {
    state,
    authStorageKey,
    decodeToken,
    isTokenValid,
    setToken,
    clearAuth,
    setUser,
    setChurch,
    setChurchPermission,
    preloadImage,
    preloadChurchImages,
    preloadUserImages
};