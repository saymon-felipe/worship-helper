// Busca de CEP (ViaCEP) e posicionamento no mapa (Nominatim/OpenStreetMap). Os dois sao gratuitos, sem chave de API e com CORS liberado.
// Politica do Nominatim: no maximo 1 requisicao por segundo e nada de busca a cada tecla, entao as consultas sao espacadas e
// disparadas so quando o CEP fica completo, ao sair do campo de endereco ou pelo botao "Localizar".

const VIACEP_URL = "https://viacep.com.br/ws";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const REQUEST_TIMEOUT_MS = 10000;
const NOMINATIM_MIN_INTERVAL_MS = 1100;

let lastNominatimRequestAt = 0;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
}

export function formatCep(value) {
    const digits = onlyDigits(value).slice(0, 8);
    return digits.length > 5 ? digits.slice(0, 5) + "-" + digits.slice(5) : digits;
}

async function fetchJson(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        return await response.json();
    } finally {
        clearTimeout(timer);
    }
}

// Devolve { cep, street, district, city, state } ou null quando o CEP nao existe. Erros de rede sao lancados.
export async function fetchAddressByCep(cep) {
    const digits = onlyDigits(cep);
    if (digits.length !== 8) {
        return null;
    }

    const data = await fetchJson(VIACEP_URL + "/" + digits + "/json/");
    if (!data || data.erro) {
        return null;
    }

    return {
        cep: digits,
        street: data.logradouro || "",
        district: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || ""
    };
}

// "Avenida Paulista, Bela Vista, Sao Paulo - SP" (cidades pequenas costumam ter CEP unico, sem rua).
export function buildAddressFromCep(info) {
    if (!info) {
        return "";
    }

    const cityState = [info.city, info.state].filter(Boolean).join(" - ");
    return [info.street, info.district, cityState].filter(Boolean).join(", ");
}

async function nominatimSearch(query) {
    const wait = lastNominatimRequestAt + NOMINATIM_MIN_INTERVAL_MS - Date.now();
    if (wait > 0) {
        await sleep(wait);
    }
    lastNominatimRequestAt = Date.now();

    const params = new URLSearchParams({
        format: "jsonv2",
        limit: "1",
        countrycodes: "br",
        "accept-language": "pt-BR",
        q: query
    });
    const results = await fetchJson(NOMINATIM_URL + "?" + params.toString());
    const first = Array.isArray(results) ? results[0] : null;
    if (!first) {
        return null;
    }

    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
}

// Tenta do mais preciso para o menos preciso: endereco digitado, so a rua do CEP, so a cidade do CEP.
// Devolve { latitude, longitude, precision: "address" | "street" | "city" } ou null. Erros de rede sao lancados.
export async function locateAddress({ address, cepInfo }) {
    const attempts = [];
    const text = String(address || "").replace(/\s+-\s+/g, ", ").trim();
    const city = cepInfo && cepInfo.city ? cepInfo.city : "";
    const cityState = cepInfo ? [cepInfo.city, cepInfo.state].filter(Boolean).join(", ") : "";

    if (text) {
        const mentionsCity = city && text.toLowerCase().includes(city.toLowerCase());
        attempts.push({ precision: "address", query: [text, mentionsCity ? "" : cityState, "Brasil"].filter(Boolean).join(", ") });
    }

    if (cepInfo && cepInfo.street && cityState) {
        attempts.push({ precision: "street", query: [cepInfo.street, cityState, "Brasil"].join(", ") });
    }

    if (cityState) {
        attempts.push({ precision: "city", query: cityState + ", Brasil" });
    }

    const tried = new Set();
    for (const attempt of attempts) {
        if (tried.has(attempt.query)) {
            continue;
        }
        tried.add(attempt.query);

        const position = await nominatimSearch(attempt.query);
        if (position) {
            return { ...position, precision: attempt.precision };
        }
    }

    return null;
}

// Link para abrir no Google Maps (esquema de URL oficial, nao exige chave de API).
export function googleMapsLink({ latitude, longitude, address, cep }) {
    const hasPin = Number.isFinite(latitude) && Number.isFinite(longitude);
    const query = hasPin
        ? latitude + "," + longitude
        : [address, cep ? formatCep(cep) : ""].filter(Boolean).join(", ");

    return query ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query) : "";
}
