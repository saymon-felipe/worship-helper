<template>
    <div class="live-assistant-control">
        <button
            type="button"
            class="assistant-toggle"
            :class="{ listening: isListening }"
            :disabled="isStarting"
            :title="isListening ? 'Pausar assistente ao vivo' : 'Ativar assistente ao vivo'"
            @click="toggle"
        >
            <span class="material-icons">{{ isListening ? 'hearing' : 'hearing_disabled' }}</span>
            <span>{{ statusLabel }}</span>
        </button>
        <span v-if="estimatedTone" class="estimated-tone">Tom est.: {{ estimatedTone }}</span>
    </div>
</template>

<script>
import api from "../config/api";
import { LiveWorshipAssistant } from "../services/liveWorshipAssistant";

export default {
    name: "liveWorshipAssistant",
    props: {
        churchId: {
            type: [Number, String],
            required: true
        },
        eventId: {
            type: [Number, String],
            required: true
        },
        currentMusicId: {
            type: [Number, String],
            default: null
        }
    },
    data() {
        return {
            assistant: null,
            state: "stopped",
            estimatedTone: "",
            isSending: false,
            lastSuggestionKey: "",
            lastSuggestionAt: 0
        };
    },
    computed: {
        isListening() {
            return this.state === "listening" || this.state === "analyzing";
        },
        isStarting() {
            return this.state === "requesting";
        },
        statusLabel() {
            const labels = {
                requesting: "Permitindo microfone",
                listening: "Ouvindo",
                analyzing: "Analisando",
                error: "Indisponivel",
                stopped: "Ativar escuta"
            };
            return labels[this.state] || "Ativar escuta";
        }
    },
    methods: {
        async toggle() {
            if (this.isListening || this.isStarting) {
                await this.stop();
                return;
            }

            await this.start();
        },
        async start() {
            this.assistant = new LiveWorshipAssistant({
                onState: (state) => {
                    this.state = state;
                },
                onTone: (tone) => {
                    this.estimatedTone = tone;
                },
                onChunk: (audio, tone) => this.identify(audio, tone)
            });

            try {
                await this.assistant.start();
            } catch (error) {
                console.error(error);
                this.state = "error";
                this.$emit("error", error.message || "Nao foi possivel acessar o microfone.");
            }
        },
        async stop() {
            const assistant = this.assistant;
            this.assistant = null;
            await assistant?.stop();
        },
        async identify(audio, tone) {
            if (this.isSending || !this.assistant) {
                return;
            }

            this.isSending = true;
            this.state = "analyzing";
            try {
                const formData = new FormData();
                formData.append("audio_chunk", audio, "live-audio.webm");
                formData.append("id_igreja", this.churchId);
                formData.append("id_evento", this.eventId);
                if (this.currentMusicId) {
                    formData.append("current_music_id", this.currentMusicId);
                }
                formData.append("detected_tone", tone || this.estimatedTone || "");

                const response = await api.post("/musicas/assistente/identificar", formData, { timeout: 30000 });
                const candidates = response.data?.returnObj?.candidates || [];
                const key = candidates.map((candidate) => `${candidate.music_id || candidate.name}:${candidate.tone || ""}`).join("|");

                if (candidates.length > 0 && (key !== this.lastSuggestionKey || Date.now() - this.lastSuggestionAt > 45000)) {
                    this.lastSuggestionKey = key;
                    this.lastSuggestionAt = Date.now();
                    this.$emit("candidates", candidates);
                }
            } catch (error) {
                const status = error.response?.status;
                if (status !== 503) {
                    console.error(error);
                }
                this.$emit("error", error.response?.data || "Nao foi possivel identificar este trecho.");
            } finally {
                this.isSending = false;
                if (this.assistant) {
                    this.state = "listening";
                }
            }
        }
    },
    mounted() {
        this.start();
    },
    beforeUnmount() {
        this.stop();
    }
};
</script>

<style scoped>
.live-assistant-control {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 1003;
    display: flex;
    align-items: center;
    gap: 8px;
}

.assistant-toggle {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-pill);
    padding: 7px 11px;
    color: var(--neutral-gray-high);
    background: var(--card-bg);
    font-size: 12px;
    font-weight: 700;
}

.assistant-toggle.listening {
    color: var(--secondary-blue-soft);
    border-color: var(--secondary-blue-soft);
}

.assistant-toggle:disabled {
    opacity: 0.65;
}

.estimated-tone {
    padding: 6px 8px;
    border-radius: var(--radius-pill);
    background: var(--primary-bg);
    color: var(--neutral-gray-high);
    font-size: 11px;
    font-weight: 700;
}
</style>
