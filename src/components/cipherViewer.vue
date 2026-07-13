<template>
    <div class="cipher-viewer">
        <div class="cipher-toolbar">
            <div>
                <h5>{{ title || "Cifra" }}</h5>
                <p v-if="artist">{{ artist }}</p>
            </div>
            <div class="transpose-controls">
                <button type="button" class="icon-button" v-on:click="transpose(-1)" title="Descer meio tom">
                    <span class="material-icons">remove</span>
                </button>
                <span>{{ transposeLabel }}</span>
                <button type="button" class="icon-button" v-on:click="transpose(1)" title="Subir meio tom">
                    <span class="material-icons">add</span>
                </button>
            </div>
        </div>

        <div class="cipher-content" v-if="cipherText">
            <pre><template v-for="(line, index) in renderedLines" :key="index"><span :class="{ 'chord-line': line.isChordLine }">{{ line.text }}</span>
</template></pre>
        </div>

        <div class="cipher-empty" v-if="!cipherText">
            <span class="material-icons">lyrics</span>
            <h5>Cifra não disponível</h5>
            <p>Essa música ainda não tem uma cifra salva no app.</p>
        </div>
    </div>
</template>
<script>
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS = {
    Db: "C#",
    Eb: "D#",
    Gb: "F#",
    Ab: "G#",
    Bb: "A#"
};
const CHORD_PATTERN = /^([A-G](?:#|b)?)((?:m|maj|min|dim|aug|sus|add|º|°|[#b0-9()+-])*)(?:\/([A-G](?:#|b)?))?$/;

function normalizeNote(note) {
    return FLATS[note] || note;
}

function transposeNote(note, steps) {
    const normalized = normalizeNote(note);
    const index = NOTES.indexOf(normalized);

    if (index === -1) {
        return note;
    }

    return NOTES[(index + steps + NOTES.length * 4) % NOTES.length];
}

function isChordToken(token) {
    return CHORD_PATTERN.test(token.replace(/[()[\],]/g, ""));
}

export default {
    name: "cipherViewer",
    props: ["cipherText", "title", "artist"],
    data() {
        return {
            transposeSteps: 0
        }
    },
    computed: {
        transposeLabel: function () {
            if (this.transposeSteps === 0) {
                return "Tom original";
            }

            return this.transposeSteps > 0 ?`+${this.transposeSteps}` : `${this.transposeSteps}`;
        },
        renderedLines: function () {
            return String(this.cipherText || "").split("\n").map((line) => {
                const isChordLine = this.isChordLine(line);

                return {
                    text: isChordLine ?this.transposeLine(line) : line,
                    isChordLine
                };
            });
        }
    },
    methods: {
        transpose: function (steps) {
            this.transposeSteps += steps;
        },
        isChordLine: function (line) {
            const tokens = line.trim().split(/\s+/).filter(Boolean);

            if (tokens.length === 0) {
                return false;
            }

            const chordTokens = tokens.filter(isChordToken).length;
            return chordTokens > 0 && chordTokens / tokens.length >= 0.65;
        },
        transposeChord: function (token) {
            const wrapperStart = token.match(/^[()[\],]*/)[0];
            const wrapperEnd = token.match(/[()[\],]*$/)[0];
            const cleanToken = token.replace(/^[()[\],]*/, "").replace(/[()[\],]*$/, "");
            const match = cleanToken.match(CHORD_PATTERN);

            if (!match) {
                return token;
            }

            const root = transposeNote(match[1], this.transposeSteps);
            const suffix = match[2] || "";
            const bass = match[3] ?"/" + transposeNote(match[3], this.transposeSteps) : "";

            return `${wrapperStart}${root}${suffix}${bass}${wrapperEnd}`;
        },
        transposeLine: function (line) {
            if (this.transposeSteps === 0) {
                return line;
            }

            return line.replace(/\S+/g, (token) => this.transposeChord(token));
        }
    }
}
</script>
<style scoped>
.cipher-viewer {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: var(--primary-bg);
    color: var(--neutral-white);
}

.cipher-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--card-border);
    background: rgba(18, 16, 41, 0.96);
}

.cipher-toolbar h5,
.cipher-toolbar p {
    margin: 0;
}

.cipher-toolbar p {
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
}

.transpose-controls {
    display: grid;
    grid-template-columns: 34px minmax(88px, auto) 34px;
    align-items: center;
    gap: 8px;
    color: var(--neutral-gray-high);
    font-size: var(--font-size-5);
    font-weight: 700;
    white-space: nowrap;
}

.icon-button {
    width: 34px;
    height: 34px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.06);
    color: var(--neutral-white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.icon-button span {
    font-size: 18px;
}

.cipher-content {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px;
}

.cipher-content pre {
    margin: 0;
    white-space: pre;
    font-family: Consolas, "Courier New", monospace;
    font-size: 14px;
    line-height: 1.65;
    color: var(--neutral-gray-high-2);
}

.chord-line {
    color: var(--secondary-blue-soft);
    font-weight: 800;
}

.cipher-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    gap: 8px;
    color: var(--neutral-gray-medium);
    padding: 24px;
}

.cipher-empty .material-icons {
    color: var(--secondary-blue-soft);
    font-size: 42px;
}

.cipher-empty h5,
.cipher-empty p {
    margin: 0;
}

@media (max-width: 560px) {
    .cipher-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .transpose-controls {
        width: 100%;
        grid-template-columns: 34px 1fr 34px;
    }
}
</style>

