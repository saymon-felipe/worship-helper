<template>
    <div class="cipher-viewer">
        <div class="cipher-toolbar">
            <div class="toolbar-info">
                <h5>{{ title || "Cifra" }}</h5>
                <p v-if="artist" class="artist-name">{{ artist }}</p>
            </div>
            
            <div class="toolbar-actions">
                <div class="transpose-controls">
                    <button type="button" class="icon-button" v-on:click="transpose(-1)" title="Descer meio tom">
                        <span class="material-icons">remove</span>
                    </button>
                    <span class="transpose-label" :class="{ 'highlighted-tone-label': isChosenToneSelected }">
                        <Transition name="fade-slide">
                            <span class="event-chosen-tone" v-if="showToneHighlight && !isChosenToneSelected && targetTone">
                                {{ targetTone }}
                            </span>
                        </Transition>
                        <span class="tone-letter">{{ selectedToneName || 'Tom' }}</span>
                        <span class="tone-offset" v-if="transposeSteps !== 0">
                            {{ transposeSteps > 0 ? '+' : '' }}{{ transposeSteps }}
                        </span>
                        <span class="tone-offset tone-original-label" v-else-if="selectedToneName">
                            Orig.
                        </span>
                    </span>
                    <button type="button" class="icon-button" v-on:click="transpose(1)" title="Subir meio tom">
                        <span class="material-icons">add</span>
                    </button>
                </div>

                <button 
                    v-if="buttonTitle" 
                    type="button" 
                    class="btn primary save-btn" 
                    @click="$emit('submit', selectedToneName)"
                >
                    {{ buttonTitle }}
                </button>
            </div>

            <!-- Discrete Close Button in the corner -->
            <button 
                v-if="showCloseButton"
                type="button" 
                class="close-button" 
                @click="$emit('close')"
                title="Fechar"
            >
                <span class="material-icons">close</span>
            </button>
        </div>

        <div 
            class="cipher-content" 
            v-if="cipherText" 
            @scroll="handleScroll"
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
            @mousedown="handleMouseDown"
            @wheel="handleWheel"
        >
            <pre><template v-for="(line, index) in renderedLines" :key="index"><span :class="{ 'chord-line': line.isChordLine }">{{ line.text }}</span>
</template></pre>
        </div>

        <div class="cipher-empty" v-if="!cipherText">
            <span class="material-icons">lyrics</span>
            <h5>Cifra não disponível</h5>
            <p>Essa música ainda não tem uma cifra salva no app.</p>
        </div>

        <!-- Floating Auto Scroll Button -->
        <button 
            v-if="cipherText"
            type="button" 
            class="floating-scroll-btn"
            :class="{ 'scrolling-active': autoScrollActive || isAtBottom }"
            :style="{ top: scrollBtnY + 'px', left: scrollBtnX + 'px' }"
            @mousedown="startDragBtn"
            @touchstart="startDragBtn"
            title="Rolagem Automática"
        >
            <span class="material-icons">
                {{ isAtBottom ? 'replay' : (autoScrollActive ? 'pause' : 'expand_more') }}
            </span>
        </button>

        <!-- Bottom Speed Selector Panel -->
        <Transition name="slide-up">
            <div class="scroll-speed-panel" v-if="showScrollPanel">
                <div class="panel-header">
                    <h6>Rolagem Automática</h6>
                    <button class="panel-close-btn" @click="showScrollPanel = false">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                
                <div class="panel-body">
                    <button 
                        type="button" 
                        class="play-pause-btn" 
                        :class="{ 'is-playing': autoScrollActive && !isAtBottom }"
                        @click="toggleAutoScroll"
                    >
                        <span class="material-icons">
                            {{ isAtBottom ? 'replay' : (autoScrollActive ? 'pause' : 'play_arrow') }}
                        </span>
                    </button>

                    <div class="speed-selector-wrapper">
                        <div class="slider-container">
                            <custom-range 
                                :min="1" 
                                :max="100" 
                                v-model="scrollSpeedValue"
                            />
                            <div class="slider-labels">
                                <span>Lento</span>
                                <span>Normal</span>
                                <span>Rápido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import customRange from "./customRange.vue";

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

function getToneRoot(tone) {
    const match = String(tone || "").trim().match(/^([A-G](?:#|b)?)/);
    return match ? normalizeNote(match[1]) : "";
}

function isChordToken(token) {
    return CHORD_PATTERN.test(token.replace(/[()[\],]/g, ""));
}

export default {
    name: "cipherViewer",
    components: {
        customRange
    },
    props: {
        cipherText: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        },
        artist: {
            type: String,
            default: ""
        },
        originalTone: {
            type: String,
            default: ""
        },
        targetTone: {
            type: String,
            default: ""
        },
        showCloseButton: {
            type: Boolean,
            default: false
        },
        buttonTitle: {
            type: String,
            default: ""
        },
        showToneHighlight: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            transposeSteps: 0,
            autoScrollActive: false,
            isAutoScrollPaused: false,
            scrollSpeedValue: 50,
            showScrollPanel: false,
            isDraggingBtn: false,
            scrollBtnX: 0,
            scrollBtnY: 0,
            isProgrammaticScroll: false,
            currentScrollTop: 0,
            isAtBottom: false
        }
    },
    computed: {
        selectedToneName: function () {
            const tone = this.resolvedOriginalTone;
            if (!tone) {
                return "";
            }

            const cleanNote = tone.trim();
            const match = cleanNote.match(/^([A-G](?:#|b)?)/);
            if (!match) {
                return cleanNote;
            }

            const root = match[1];
            const suffix = cleanNote.slice(root.length);
            const transposedRoot = transposeNote(root, this.transposeSteps);
            return `${transposedRoot}${suffix}`;
        },
        resolvedOriginalTone: function () {
            if (this.originalTone) {
                return this.originalTone;
            }
            return this.detectOriginalTone(this.cipherText);
        },
        renderedLines: function () {
            const optimizedText = this.optimizeTabs(this.cipherText);
            return String(optimizedText || "").split("\n").map((line) => {
                const isChordLine = this.isChordLine(line);

                return {
                    text: isChordLine ? this.transposeLine(line) : line,
                    isChordLine
                };
            });
        },
        isChosenToneSelected: function () {
            if (!this.showToneHighlight || !this.targetTone || !this.selectedToneName) {
                return false;
            }

            const clean = (tone) => {
                if (!tone) return "";
                let t = String(tone).trim();
                const match = t.match(/^([A-G](?:#|b)?)(.*)$/);
                if (match) {
                    const root = normalizeNote(match[1]);
                    const suffix = match[2] || "";
                    return `${root}${suffix}`;
                }
                return t;
            };

            return clean(this.selectedToneName) === clean(this.targetTone);
        },

        scrollSpeedPxPerMs() {
            const val = this.scrollSpeedValue;
            if (val <= 50) {
                return 0.01 + (0.05 - 0.01) * ((val - 1) / 49);
            } else {
                return 0.05 + (0.20 - 0.05) * ((val - 50) / 50);
            }
        }
    },
    methods: {
        syncTargetTone: function () {
            const originalRoot = getToneRoot(this.resolvedOriginalTone);
            const targetRoot = getToneRoot(this.targetTone);

            if (!originalRoot || !targetRoot) {
                this.transposeSteps = 0;
                return;
            }

            const originalIndex = NOTES.indexOf(originalRoot);
            const targetIndex = NOTES.indexOf(targetRoot);

            if (originalIndex === -1 || targetIndex === -1) {
                this.transposeSteps = 0;
                return;
            }

            let steps = targetIndex - originalIndex;
            if (steps > 6) {
                steps -= NOTES.length;
            } else if (steps < -6) {
                steps += NOTES.length;
            }

            this.transposeSteps = steps;
        },
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
        },
        optimizeTabs: function (cipherText) {
            if (!cipherText) return "";

            const lines = cipherText.split("\n");
            const isTab = lines.map(line => {
                const trimmed = line.trim();
                if (!trimmed) return false;
                return /^[A-G|a-g]?\|?[-0-9p~h/\\|x()b]{5,}/.test(trimmed) && trimmed.includes("-");
            });

            let i = 0;
            while (i < lines.length) {
                if (isTab[i]) {
                    let start = i;
                    while (i < lines.length && isTab[i]) {
                        i++;
                    }
                    let end = i;

                    let maxContentIndex = 0;
                    for (let j = start; j < end; j++) {
                        const line = lines[j];
                        let lastIdx = line.length - 1;
                        while (lastIdx >= 0) {
                            const char = line[lastIdx];
                            if (char !== '-' && char !== '|' && char !== ' ' && char !== '\r') {
                                break;
                            }
                            lastIdx--;
                        }
                        if (lastIdx > maxContentIndex) {
                            maxContentIndex = lastIdx;
                        }
                    }

                    let targetLength = Math.max(maxContentIndex + 4, 38);

                    for (let j = start; j < end; j++) {
                        let line = lines[j];
                        if (line.length > targetLength) {
                            lines[j] = line.slice(0, targetLength);
                        } else if (line.length < targetLength) {
                            lines[j] = line.padEnd(targetLength, "-");
                        }
                    }
                } else {
                    i++;
                }
            }

            return lines.join("\n");
        },
        detectOriginalTone: function (text) {
            if (!text) return "";
            const lines = String(text).split("\n");
            for (const line of lines) {
                if (this.isChordLine(line)) {
                    const tokens = line.trim().split(/\s+/).filter(Boolean);
                    if (tokens.length > 0) {
                        const cleanChord = tokens[0].replace(/[()[\],]/g, "");
                        const match = cleanChord.match(/^([A-G](?:#|b)?m?)/);
                        if (match) {
                            return match[1];
                        }
                    }
                }
            }
            return "";
        },
        toggleAutoScroll() {
            if (this.isAtBottom) {
                const container = this.$el.querySelector(".cipher-content");
                if (container) {
                    container.scrollTop = 0;
                    this.currentScrollTop = 0;
                }
                this.isAtBottom = false;
                this.startAutoScroll();
            } else if (this.autoScrollActive) {
                this.stopAutoScroll();
            } else {
                this.startAutoScroll();
            }
        },
        startAutoScroll() {
            this.stopAutoScroll();
            this.autoScrollActive = true;
            this.isAutoScrollPaused = false;
            this.isAtBottom = false;
            this.lastScrollTime = performance.now();
            
            const container = this.$el.querySelector(".cipher-content");
            if (!container) return;
            
            this.currentScrollTop = container.scrollTop;

            const scrollFrame = (timestamp) => {
                if (!this.autoScrollActive) return;

                const elapsed = timestamp - this.lastScrollTime;
                this.lastScrollTime = timestamp;

                if (!this.isAutoScrollPaused) {
                    const speedPxPerMs = this.scrollSpeedPxPerMs;
                    const delta = elapsed * speedPxPerMs;
                    
                    this.currentScrollTop += delta;
                    
                    if (this.currentScrollTop + container.clientHeight >= container.scrollHeight - 1) {
                        this.stopAutoScroll();
                        this.isAtBottom = true;
                        return;
                    }

                    this.isProgrammaticScroll = true;
                    container.scrollTop = this.currentScrollTop;
                    
                    window.requestAnimationFrame(() => {
                        this.isProgrammaticScroll = false;
                    });
                }

                this.scrollFrameId = requestAnimationFrame(scrollFrame);
            };

            this.scrollFrameId = requestAnimationFrame(scrollFrame);
        },
        stopAutoScroll() {
            this.autoScrollActive = false;
            if (this.scrollFrameId) {
                cancelAnimationFrame(this.scrollFrameId);
                this.scrollFrameId = null;
            }
            if (this.resumeTimer) {
                clearTimeout(this.resumeTimer);
                this.resumeTimer = null;
            }
        },
        handleScroll() {
            const container = this.$el.querySelector(".cipher-content");
            if (container) {
                const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
                this.isAtBottom = atBottom;
            }
            
            if (this.isProgrammaticScroll || !this.autoScrollActive) {
                return;
            }
            this.isAutoScrollPaused = true;
            this.startResumeTimer();
        },
        handleTouchStart() {
            if (!this.autoScrollActive) return;
            this.isAutoScrollPaused = true;
            clearTimeout(this.resumeTimer);
        },
        handleTouchEnd() {
            if (!this.autoScrollActive) return;
            this.startResumeTimer();
        },
        handleMouseDown(event) {
            if (!this.autoScrollActive) return;
            if (event.button !== 0) return; // Only trigger for left clicks
            
            this.isAutoScrollPaused = true;
            clearTimeout(this.resumeTimer);
            
            const onMouseUp = () => {
                window.removeEventListener("mouseup", onMouseUp);
                this.startResumeTimer();
            };
            window.addEventListener("mouseup", onMouseUp);
        },
        handleWheel() {
            if (!this.autoScrollActive) return;
            this.isAutoScrollPaused = true;
            clearTimeout(this.resumeTimer);
            this.startResumeTimer();
        },
        startResumeTimer() {
            clearTimeout(this.resumeTimer);
            this.resumeTimer = setTimeout(() => {
                const container = this.$el.querySelector(".cipher-content");
                if (container) {
                    this.currentScrollTop = container.scrollTop;
                }
                this.isAutoScrollPaused = false;
                this.lastScrollTime = performance.now();
            }, 800);
        },
        startDragBtn(event) {
            event.preventDefault();
            this.isDraggingBtn = false;
            
            const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
            const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
            
            const startX = this.scrollBtnX;
            const startY = this.scrollBtnY;
            const dragStartX = clientX;
            const dragStartY = clientY;
            
            const onDrag = (e) => {
                const curX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const curY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
                
                const dx = curX - dragStartX;
                const dy = curY - dragStartY;
                
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.isDraggingBtn = true;
                }
                
                let newX = startX + dx;
                let newY = startY + dy;
                
                const btnSize = 48;
                const margin = 16;
                
                newX = Math.max(margin, Math.min(window.innerWidth - btnSize - margin, newX));
                newY = Math.max(margin, Math.min(window.innerHeight - btnSize - margin, newY));
                
                this.scrollBtnX = newX;
                this.scrollBtnY = newY;
            };
            
            const stopDrag = () => {
                window.removeEventListener(event.type === 'touchstart' ? 'touchmove' : 'mousemove', onDrag);
                window.removeEventListener(event.type === 'touchstart' ? 'touchend' : 'mouseup', stopDrag);
                
                if (!this.isDraggingBtn) {
                    this.handleBtnClick();
                }
            };
            
            window.addEventListener(event.type === 'touchstart' ? 'touchmove' : 'mousemove', onDrag, { passive: false });
            window.addEventListener(event.type === 'touchstart' ? 'touchend' : 'mouseup', stopDrag);
        },
        handleResize() {
            const btnSize = 48;
            const margin = 16;
            this.scrollBtnX = Math.max(margin, Math.min(window.innerWidth - btnSize - margin, this.scrollBtnX));
            this.scrollBtnY = Math.max(margin, Math.min(window.innerHeight - btnSize - margin, this.scrollBtnY));
        },
        handleBtnClick() {
            this.showScrollPanel = !this.showScrollPanel;
        }
    },
    watch: {
        targetTone: function () {
            this.syncTargetTone();
        },
        cipherText: function () {
            this.syncTargetTone();
        }
    },
    mounted: function () {
        this.syncTargetTone();
        this.scrollBtnX = window.innerWidth - 64;
        this.scrollBtnY = window.innerHeight - 120;
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        this.stopAutoScroll();
        window.removeEventListener("resize", this.handleResize);
    }
}
</script>

<style scoped>
.cipher-viewer {
    height: 100%;
    min-height: 0;
    min-width: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: var(--primary-bg);
    color: var(--neutral-white);
    overflow: hidden;
    position: relative;
}

.cipher-toolbar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 48px 12px 16px;
    border-bottom: 1px solid var(--card-border);
    background: rgba(18, 16, 41, 0.96);
}

.toolbar-info {
    flex: 1;
    min-width: 0;
}

.toolbar-info h5 {
    font-size: 16px;
    font-weight: 700;
    color: var(--neutral-white);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist-name {
    font-size: 13px;
    color: var(--neutral-gray-medium);
    margin: 3px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.close-button {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-gray-medium);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    transition: all var(--transition-fast);
    padding: 0;
    z-index: 10;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--neutral-white);
    border-color: rgba(255, 255, 255, 0.2);
}

.close-button span {
    font-size: 18px;
}

.save-btn {
    padding: 6px 14px;
    font-size: 13px;
    height: 34px;
    border-radius: var(--radius-pill);
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
}

.transpose-controls {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-pill);
    padding: 2px 4px;
}

.transpose-label {
    min-width: 60px;
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--neutral-gray-high);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
}

.transpose-label.highlighted-tone-label {
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.3);
    color: var(--secondary-blue-soft);
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    min-width: 50px;
}

.tone-offset {
    font-size: 11px;
    opacity: 0.75;
    margin-left: 4px;
    font-weight: 500;
}

.icon-button {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--radius-pill);
    background: rgba(255, 255, 255, 0.05);
    color: var(--neutral-white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.icon-button:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--secondary-blue-soft);
}

.icon-button span {
    font-size: 18px;
}

.event-chosen-tone {
    font-size: 10px;
    font-weight: 700;
    color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.08);
    border: 1px dashed rgba(56, 182, 255, 0.25);
    padding: 1px 5px;
    border-radius: 4px;
    margin-right: 6px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    max-width: 40px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-8px) scale(0.8);
    max-width: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
    border-color: transparent;
}

.cipher-content {
    flex: 1;
    min-height: 0;
    min-width: 0;
    width: 100%;
    overflow: auto;
    padding: 16px;
}

.cipher-content pre {
    margin: 0;
    white-space: pre;
    font-family: Consolas, "Courier New", monospace;
    font-size: 13.5px;
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

/* Floating scroll button */
.floating-scroll-btn {
    position: fixed;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--primary-primary-blue-high-2);
    border: 2px solid rgba(255, 255, 255, 0.15);
    color: var(--neutral-white);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 999;
    touch-action: none;
    transition: background-color var(--transition-fast), border-color var(--transition-fast), transform 0.1s ease;
}

.floating-scroll-btn:hover {
    background: var(--secondary-blue-soft);
    border-color: var(--neutral-white);
}

.floating-scroll-btn.scrolling-active {
    background: var(--secondary-blue-soft);
    border-color: var(--neutral-white);
    animation: pulseScrollGlow 2.5s infinite;
}

@keyframes pulseScrollGlow {
    0% { box-shadow: 0 0 0 0 rgba(56, 182, 255, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(56, 182, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(56, 182, 255, 0); }
}

.floating-scroll-btn:active {
    transform: scale(0.95);
}

.floating-scroll-btn span {
    font-size: 24px;
}

/* Speed control panel */
.scroll-speed-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(18, 16, 41, 0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--card-border);
    padding: 16px;
    z-index: 1001;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-header h6 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: var(--neutral-white);
}

.panel-close-btn {
    background: transparent;
    border: none;
    color: var(--neutral-gray-medium);
    cursor: pointer;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.panel-close-btn span {
    font-size: 18px;
}

.panel-body {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
}

.play-pause-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: var(--neutral-white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.play-pause-btn:hover {
    background: rgba(255, 255, 255, 0.15);
}

.play-pause-btn.is-playing {
    background: var(--secondary-blue-soft);
    color: var(--neutral-black-low);
    box-shadow: 0 0 12px rgba(56, 182, 255, 0.3);
}

.play-pause-btn span {
    font-size: 22px;
}

.speed-selector-wrapper {
    flex: 1;
    min-width: 0;
}

/* Custom range slider styling */
.slider-container {
    display: flex;
    flex-direction: column;
    width: 100%;
}



.slider-labels {
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
    margin-top: 4px;
}

.slider-labels span {
    font-size: 10px;
    font-weight: 700;
    color: var(--neutral-gray-medium);
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
}

@media (max-width: 560px) {
    .cipher-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 12px 16px;
    }

    .toolbar-info {
        padding-right: 40px;
    }

    .toolbar-actions {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .transpose-controls {
        flex: 1;
        width: 100%;
        justify-content: space-between;
    }

    .close-button {
        top: 12px;
        right: 16px;
        transform: none;
    }
}
</style>
