<template>
    <div class="event-location-map" :style="{ height: height }">
        <div ref="mapElement" class="map-canvas" role="img" :aria-label="hasPin ? 'Mapa com o pino do local do evento' : 'Mapa'"></div>
    </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vista inicial (Brasil inteiro) quando ainda nao ha pino.
const DEFAULT_CENTER = [-14.235, -51.9253];
const DEFAULT_ZOOM = 4;
const PIN_ZOOM = 16;

// O icone padrao do Leaflet resolve as imagens por caminho relativo, que o bundler quebra: aponta para os arquivos importados.
const pinIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default {
    name: "eventLocationMap",
    props: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        editable: { type: Boolean, default: false },
        height: { type: String, default: "240px" }
    },
    emits: ["change"],
    computed: {
        hasPin: function () {
            return Number.isFinite(this.latitude) && Number.isFinite(this.longitude);
        },
        pinKey: function () {
            return this.latitude + "," + this.longitude;
        }
    },
    watch: {
        pinKey: function () {
            this.syncPin();
        },
        editable: function () {
            if (this.marker) {
                this.marker.dragging[this.editable ? "enable" : "disable"]();
            }
        }
    },
    methods: {
        emitPosition: function (latlng) {
            // Ajuste feito no proprio mapa: o pino acompanha o clique/arrasto sem recentralizar a vista embaixo da mao da pessoa.
            this.userPinKey = latlng.lat + "," + latlng.lng;
            this.$emit("change", { latitude: latlng.lat, longitude: latlng.lng });
        },
        syncPin: function () {
            if (!this.map) {
                return;
            }

            if (!this.hasPin) {
                if (this.marker) {
                    this.marker.remove();
                    this.marker = null;
                }
                this.map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
                return;
            }

            const position = [this.latitude, this.longitude];

            if (!this.marker) {
                this.marker = L.marker(position, { icon: pinIcon, draggable: this.editable, keyboard: false }).addTo(this.map);
                this.marker.on("dragend", () => this.emitPosition(this.marker.getLatLng()));
            } else {
                this.marker.setLatLng(position);
            }

            if (this.userPinKey === this.pinKey) {
                return;
            }

            this.map.setView(position, Math.max(this.map.getZoom(), PIN_ZOOM));
        }
    },
    mounted: function () {
        this.map = L.map(this.$refs.mapElement, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: false,
            // No celular o arrasto com um dedo rola a pagina; o pino continua movel e o mapa responde a toque e pinca.
            dragging: !L.Browser.mobile
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a>"
        }).addTo(this.map);

        this.map.on("click", (event) => {
            if (this.editable) {
                this.emitPosition(event.latlng);
            }
        });

        // O modal e as transicoes montam o mapa antes do tamanho final: sem isso o Leaflet desenha so parte dos blocos.
        this.resizeObserver = typeof ResizeObserver === "function"
            ? new ResizeObserver(() => this.map && this.map.invalidateSize())
            : null;
        if (this.resizeObserver) {
            this.resizeObserver.observe(this.$refs.mapElement);
        }

        this.syncPin();
    },
    beforeUnmount: function () {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.marker = null;
        }
    }
}
</script>

<style scoped>
.event-location-map {
    position: relative;
    z-index: 0; /* contem os z-index internos do Leaflet (ate 1000) para nao cobrirem modais e a navegacao */
    isolation: isolate;
    width: 100%;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.map-canvas {
    width: 100%;
    height: 100%;
    background: var(--primary-primary-blue-low);
}
</style>
