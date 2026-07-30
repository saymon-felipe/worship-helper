<template>
    <div class="create-music-wizard">
        <!-- Barra de Progresso Mobile-First -->
        <div class="progress-tracker">
            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (currentStep / 3 * 100) + '%' }"></div>
            </div>
            <div class="step-indicator">
                <span class="step-text">Etapa {{ currentStep }} de 3</span>
                <span class="step-title">{{ currentStepTitle }}</span>
            </div>
        </div>

        <form id="create-music-form" @submit.prevent="handleFormSubmit()">
            <!-- ETAPA 1: DADOS DA MÚSICA -->
            <div class="wizard-step-pane" v-if="currentStep === 1">
                <div class="glass-form-card">
                    <div class="form-field">
                        <label for="name">Nome da Música</label>
                        <div class="form-input-wrapper">
                            <span class="material-icons field-icon">music_note</span>
                            <input type="text" name="name" id="name" placeholder="Ex: Grandioso És Tu" v-model.trim="form.name" required>
                        </div>
                    </div>

                    <div class="form-field">
                        <label for="artist">Artista / Ministério</label>
                        <div class="form-input-wrapper">
                            <span class="material-icons field-icon">person</span>
                            <input type="text" name="artist" id="artist" placeholder="Ex: Harpa Cristã" v-model.trim="form.artist">
                        </div>
                    </div>

                    <div class="form-field tags-field">
                        <label>Tags</label>
                        <selectMultiple :items="musicTagsList" maxlength="3" @selectedItems="selectTags($event)"></selectMultiple>
                    </div>
                </div>

                <div class="wizard-nav-footer">
                    <button type="button" class="btn btn-cancel" @click="$emit('success')">
                        Cancelar
                    </button>
                    <button type="button" class="btn primary" :disabled="!canSearchVideo" @click="changeStep(2)">
                        Buscar Vídeo <span class="material-icons">arrow_forward</span>
                    </button>
                </div>
            </div>

            <!-- ETAPA 2: SELEÇÃO DO YOUTUBE -->
            <div class="wizard-step-pane" v-if="currentStep === 2">
                <div class="search-summary-bar">
                    <div class="search-meta">
                        <span class="material-icons">search</span>
                        <p>{{ form.name }} <span class="artist-sep">•</span> {{ form.artist }}</p>
                    </div>
                    <button type="button" class="btn-quick-edit" @click="changeStep(1)">
                        <span class="material-icons">edit</span>
                    </button>
                </div>

                <!-- Estados Auxiliares -->
                <div class="wizard-state-card" v-if="loadingMusic">
                    <span class="spinner-loader"></span>
                    <h6>Buscando no YouTube...</h6>
                    <p>Localizando as melhores versões para você.</p>
                </div>

                <div class="wizard-state-card" v-else-if="musicList.length === 0">
                    <span class="material-icons state-icon">sentiment_dissatisfied</span>
                    <h6>Nenhum vídeo encontrado</h6>
                    <p>Ajuste os dados da música e tente novamente.</p>
                </div>

                <!-- Lista de Resultados (Mobile Layout) -->
                <div class="results-scroll-pane" v-else>
                    <div class="video-card-mobile" v-for="(video, index) in musicList" :key="index" :class="{ selected: selectedVideo && selectedVideo.videoId === video.videoId }">
                        <div class="card-clickable-area" @click="selectVideo(video)">
                            <div class="video-thumb-pane" @click.stop="openPreviewModal(video.videoId)">
                                <img :src="video.videoThumbnail" alt="Thumbnail">
                                <div class="thumb-play-overlay">
                                    <span class="material-icons">play_circle_filled</span>
                                </div>
                            </div>
                            <div class="video-info-pane">
                                <span class="video-title">{{ video.title }}</span>
                                <div class="video-meta-row">
                                    <span class="video-channel">{{ video.channelTitle }}</span>
                                    <span class="video-meta-sep">•</span>
                                    <span class="video-meta-time">{{ relativeTime(video.publishedAt) }}</span>
                                </div>
                            </div>
                            <div class="selection-check-column">
                                <span class="material-icons select-checkmark" :class="{ checked: selectedVideo && selectedVideo.videoId === video.videoId }">
                                    {{ selectedVideo && selectedVideo.videoId === video.videoId ? 'check_circle' : 'radio_button_unchecked' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="wizard-nav-footer">
                    <button type="button" class="btn secondary" @click="changeStep(1)">
                        <span class="material-icons">arrow_back</span> Voltar
                    </button>
                    <button type="button" class="btn primary" :disabled="!selectedVideo || loadingCipher" @click="changeStep(3)">
                        Escolher Cifra <span class="material-icons">arrow_forward</span>
                    </button>
                </div>
            </div>

            <!-- ETAPA 3: SELEÇÃO DA CIFRA -->
            <div class="wizard-step-pane" v-if="currentStep === 3">
                <div class="selected-reference-card" v-if="selectedVideo">
                    <img :src="selectedVideo.videoThumbnail" alt="">
                    <div class="ref-details">
                        <span class="ref-tag">Vídeo de Referência</span>
                        <p class="ref-title">{{ selectedVideo.title }}</p>
                    </div>
                </div>

                <div class="cipher-source-selector">
                    <button type="button" class="source-tab" :class="{ active: cipherMode === 'cifra_club' }" @click="selectCipherMode('cifra_club')">
                        <span class="material-icons">search</span>
                        <span>Cifra Club</span>
                    </button>
                    <button type="button" class="source-tab" :class="{ active: cipherMode === 'custom_pdf' }" @click="selectCipherMode('custom_pdf')">
                        <span class="material-icons">upload_file</span>
                        <span>Enviar PDF</span>
                    </button>
                </div>

                <!-- Estados Auxiliares -->
                <div class="wizard-state-card" v-if="cipherMode === 'cifra_club' && loadingCipher">
                    <span class="spinner-loader"></span>
                    <h6>Procurando cifras...</h6>
                    <p>Buscando as versões mais completas.</p>
                </div>

                <div class="wizard-state-card" v-if="cipherMode === 'cifra_club' && !loadingCipher && cipherList.length === 0">
                    <span class="material-icons state-icon">menu_book</span>
                    <h6>Nenhuma cifra encontrada</h6>
                    <p>Tente ajustar os dados de busca no passo 1.</p>
                </div>

                <!-- Lista de Cifras (Mobile Layout) -->
                <div class="results-scroll-pane compact" v-if="cipherMode === 'cifra_club' && !loadingCipher && cipherList.length > 0">
                    <div class="cipher-card-mobile" v-for="(cipher, index) in cipherList" :key="index" :class="{ selected: selectedCipher && selectedCipher.href === cipher.href }" @click="selectCipher(cipher)">
                        <div class="cipher-card-main">
                            <span class="material-icons doc-icon">article</span>
                            <div class="cipher-details">
                                <span class="cipher-title">{{ cipher.title }}</span>
                                <span class="cipher-provider">Cifra Club</span>
                            </div>
                        </div>
                        <div class="cipher-card-actions">
                            <a :href="cipher.href" target="_blank" class="btn-view-site" @click.stop>
                                <span class="material-icons">open_in_new</span>
                                <span>Ver</span>
                            </a>
                            <div class="selection-check-column">
                                <span class="material-icons select-checkmark" :class="{ checked: selectedCipher && selectedCipher.href === cipher.href }">
                                    {{ selectedCipher && selectedCipher.href === cipher.href ? 'check_circle' : 'radio_button_unchecked' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pdf-import-pane" v-if="cipherMode === 'custom_pdf'">
                    <input ref="cipherPdfInput" class="pdf-file-input" type="file" accept="application/pdf" @change="handlePdfFileChange">
                    <button type="button" class="pdf-upload-card" :class="{ selected: pdfFileName }" @click="$refs.cipherPdfInput.click()">
                        <span class="material-icons">picture_as_pdf</span>
                        <span class="pdf-upload-copy">
                            <strong>{{ pdfFileName || "Selecionar PDF" }}</strong>
                            <small>PDF com texto selecionavel, ate 5 MB</small>
                        </span>
                    </button>

                    <div class="wizard-state-card compact-state" v-if="pdfImporting">
                        <span class="spinner-loader"></span>
                        <h6>Importando cifra...</h6>
                        <p>Extraindo acordes e letra do PDF.</p>
                    </div>

                    <div class="pdf-page-list" v-if="!pdfImporting && pdfPages.length > 0">
                        <button
                            type="button"
                            class="pdf-page-option"
                            v-for="page in pdfPages"
                            :key="page.page"
                            :class="{ selected: isPdfPageSelected(page) }"
                            @click="togglePdfPage(page)"
                        >
                            <span class="material-icons">{{ isPdfPageSelected(page) ? 'check_circle' : 'radio_button_unchecked' }}</span>
                            <span class="page-copy">
                                <strong>{{ page.label }}</strong>
                                <small v-if="page.detected_artist || page.detected_tone">
                                    {{ page.detected_artist }}{{ page.detected_artist && page.detected_tone ? " - " : "" }}{{ page.detected_tone ? "Tom: " + page.detected_tone : "" }}
                                </small>
                            </span>
                        </button>
                    </div>

                    <div class="pdf-preview-section" v-if="!pdfImporting && pdfPages.length > 0">
                        <label for="pdf-cipher-preview">Preview da cifra</label>
                        <textarea
                            id="pdf-cipher-preview"
                            v-model="pdfPreviewText"
                            spellcheck="false"
                            placeholder="A cifra importada vai aparecer aqui..."
                        ></textarea>
                    </div>
                </div>

                <!-- Banner de Pronto -->
                <div class="ready-banner" v-if="canFinishCipher">
                    <span class="material-icons">check_circle</span>
                    <div class="ready-text">
                        <h6>Tudo pronto!</h6>
                        <p>O louvor está pronto para ser adicionado ao acervo.</p>
                    </div>
                </div>

                <div class="wizard-nav-footer">
                    <button type="button" class="btn secondary" @click="changeStep(2)">
                        <span class="material-icons">arrow_back</span> Voltar
                    </button>
                    <button type="button" class="btn primary success-btn" :disabled="!canFinishCipher || savingMusic" @click="createMusic()">
                        <span class="material-icons">{{ savingMusic ? 'sync' : 'done_all' }}</span> {{ savingMusic ? 'Salvando...' : 'Finalizar' }}
                    </button>
                </div>
            </div>

            <p class="response">{{ response }}</p>
            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>

        <!-- Modal Superior Lightbox de Preview do YouTube -->
        <Teleport to="body">
            <div class="youtube-preview-modal-wrapper" v-if="modalPreviewVideoId" @click="closeModalPreview()">
                <div class="youtube-preview-modal-content" @click.stop>
                    <button type="button" class="btn-close-preview-modal" @click="closeModalPreview()">
                        <span class="material-icons">close</span>
                    </button>
                    <div class="iframe-modal-aspect">
                        <iframe :src="'https://www.youtube.com/embed/' + modalPreviewVideoId + '?autoplay=1'" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script>
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import selectMultiple from "./selectMultiple.vue";

export default {
    name: "createMusicModalContent",
    mixins: [globalMethods],
    data() {
        return {
            form: {
                name: "",
                artist: ""
            },
            currentStep: 1,
            modalPreviewVideoId: null,
            loadingMusic: false,
            loadingCipher: false,
            pdfImporting: false,
            savingMusic: false,
            cipherMode: "cifra_club",
            cipherList: [],
            musicList: [],
            selectedVideo: null,
            selectedCipher: null,
            pdfPages: [],
            selectedPdfPageNumbers: [],
            pdfPreviewText: "",
            pdfFileName: "",
            musicTags: [],
            musicTagsList: []
        }
    },
    components: {
        selectMultiple
    },
    computed: {
        canSearchVideo() {
            return Boolean(this.form.name && this.form.name.trim()) && this.musicTags.length > 0;
        },
        canFinishCipher() {
            if (!this.selectedVideo) {
                return false;
            }

            if (this.cipherMode === "custom_pdf") {
                return Boolean(this.pdfPreviewText && this.pdfPreviewText.trim());
            }

            return Boolean(this.selectedCipher);
        },
        currentStepTitle() {
            const titles = [
                "Dados da Música",
                "Escolha o Vídeo",
                "Escolha a Cifra"
            ];
            return titles[this.currentStep - 1] || "";
        }
    },
    methods: {
        selectTags: function (event) {
            this.musicTags = event;
        },
        selectCipher: function (cipher) {
            this.selectedCipher = cipher;
        },
        selectCipherMode: function (mode) {
            this.cipherMode = mode;
            if (mode === "cifra_club" && this.currentStep === 3 && this.cipherList.length === 0 && !this.loadingCipher) {
                this.searchCipher();
            }
        },
        normalizeMatchText: function (value) {
            return String(value || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim();
        },
        selectedPdfPageObjects: function () {
            return this.pdfPages
                .filter(page => this.selectedPdfPageNumbers.includes(page.page))
                .sort((a, b) => a.page - b.page);
        },
        syncPdfPreviewText: function () {
            this.pdfPreviewText = this.selectedPdfPageObjects()
                .map(page => page.text)
                .join("\n\n");
        },
        isPdfPageSelected: function (page) {
            return this.selectedPdfPageNumbers.includes(page.page);
        },
        togglePdfPage: function (page) {
            if (this.isPdfPageSelected(page)) {
                if (this.selectedPdfPageNumbers.length === 1) {
                    return;
                }
                this.selectedPdfPageNumbers = this.selectedPdfPageNumbers.filter(pageNumber => pageNumber !== page.page);
            } else {
                this.selectedPdfPageNumbers.push(page.page);
            }

            this.syncPdfPreviewText();
        },
        selectDefaultPdfPage: function () {
            if (this.pdfPages.length === 0) {
                this.selectedPdfPageNumbers = [];
                this.pdfPreviewText = "";
                return;
            }

            const musicName = this.normalizeMatchText(this.form.name);
            const matchingPage = this.pdfPages.find((page) => {
                const pageTitle = this.normalizeMatchText(page.detected_title);
                return pageTitle && musicName && (pageTitle.includes(musicName) || musicName.includes(pageTitle));
            });
            const selectedPage = matchingPage || this.pdfPages[0];
            this.selectedPdfPageNumbers = [selectedPage.page];
            this.syncPdfPreviewText();
        },
        resetPdfImport: function () {
            this.pdfPages = [];
            this.selectedPdfPageNumbers = [];
            this.pdfPreviewText = "";
            this.pdfFileName = "";
            if (this.$refs.cipherPdfInput) {
                this.$refs.cipherPdfInput.value = "";
            }
        },
        selectVideo: function (video) {
            this.selectedVideo = video;
            this.selectedCipher = null;
            this.cipherList = [];
            this.resetPdfImport();
            if (!this.form.artist) {
                this.form.artist = video.channelTitle || "";
            }
        },
        validateSearch: function () {
            if (!this.form.name) {
                this.showResponse("Informe o nome da música", ".response", "error");
                return false;
            }
            if (this.musicTags.length === 0) {
                this.showResponse("Selecione pelo menos uma tag", ".response", "error");
                return false;
            }
            return true;
        },
        openPreviewModal: function (videoId) {
            this.modalPreviewVideoId = videoId;
        },
        closeModalPreview: function () {
            this.modalPreviewVideoId = null;
        },
        changeStep: function (step) {
            if (step === 1) {
                this.currentStep = 1;
            } else if (step === 2) {
                if (this.validateSearch()) {
                    this.currentStep = 2;
                    if (this.musicList.length === 0 && !this.loadingMusic) {
                        this.searchMusic();
                    }
                }
            } else if (step === 3) {
                if (this.validateSearch() && this.selectedVideo) {
                    this.currentStep = 3;
                    if (this.cipherMode === "cifra_club" && this.cipherList.length === 0 && !this.loadingCipher) {
                        this.searchCipher();
                    }
                }
            }
        },
        handleFormSubmit: function () {
            if (this.currentStep === 1) {
                this.changeStep(2);
            } else if (this.currentStep === 2) {
                this.changeStep(3);
            } else if (this.currentStep === 3) {
                this.createMusic();
            }
        },
        searchCipher: async function () {
            if (!this.validateSearch()) return;

            this.loadingCipher = true;
            this.cipherList = [];
            this.selectedCipher = null;

            try {
                const response = await api.post("/musicas/procurar-cifra", {
                    name: this.form.name,
                    artist: this.form.artist,
                    id_igreja: this.getCurrentChurchId()
                });
                this.cipherList = response.data.returnObj;
            } catch (error) {
                const message = error.response && error.response.data ? error.response.data.message || error.response.data : "Não foi possível buscar cifras";
                this.showResponse(message, ".response", "error");
            } finally {
                this.loadingCipher = false;
            }
        },
        searchMusic: async function () {
            if (!this.validateSearch()) return;

            this.loadingMusic = true;
            this.musicList = [];
            this.cipherList = [];
            this.selectedVideo = null;
            this.selectedCipher = null;
            this.modalPreviewVideoId = null;
            this.resetPdfImport();

            try {
                const response = await api.post("/musicas/procurar", {
                    name: this.form.name,
                    artist: this.form.artist,
                    id_igreja: this.getCurrentChurchId()
                });
                this.musicList = response.data.returnObj;
            } catch (error) {
                const message = error.response && error.response.data ? error.response.data.message || error.response.data : "Não foi possível buscar músicas";
                this.showResponse(message, ".response", "error");
            } finally {
                this.loadingMusic = false;
            }
        },
        handlePdfFileChange: async function (event) {
            const file = event.target.files && event.target.files[0];

            if (!file) {
                return;
            }

            const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
            if (!isPdf) {
                this.showResponse("Envie um arquivo PDF valido", ".response", "error");
                this.resetPdfImport();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                this.showResponse("O PDF deve ter no maximo 5 MB", ".response", "error");
                this.resetPdfImport();
                return;
            }

            const formData = new FormData();
            formData.append("id_igreja", this.getCurrentChurchId());
            formData.append("cipher_pdf", file);

            this.pdfImporting = true;
            this.pdfFileName = file.name;
            this.pdfPages = [];
            this.selectedPdfPageNumbers = [];
            this.pdfPreviewText = "";

            try {
                const response = await api.post("/musicas/importar-cifra-pdf", formData, { timeout: 60000 });
                this.pdfPages = response.data.returnObj.pages || [];
                if (this.pdfPages.length === 0) {
                    this.showResponse("Nao foi possivel extrair cifras deste PDF", ".response", "error");
                    return;
                }
                this.selectDefaultPdfPage();
            } catch (error) {
                const message = error.response && error.response.data ? error.response.data.message || error.response.data : "Nao foi possivel importar o PDF";
                this.showResponse(message, ".response", "error");
            } finally {
                this.pdfImporting = false;
            }
        },
        createMusic: async function () {
            if (this.musicTags.length == 0) {
                this.showResponse("Tags faltando", ".response", "error");
                return;
            }

            if (!this.selectedVideo || !this.canFinishCipher) {
                this.showResponse("Vídeo ou cifra faltando", ".response", "error");
                return;
            }

            const selectedPdfPages = this.selectedPdfPageObjects();
            const firstPdfPage = selectedPdfPages[0] || {};
            const isCustomPdf = this.cipherMode === "custom_pdf";
            const data = {
                name: this.form.name,
                artist: this.form.artist,
                id_igreja: this.getCurrentChurchId(),
                video_url: this.selectedVideo.url,
                cipher_source: isCustomPdf ? "custom_pdf" : "cifra_club",
                cipher_url: isCustomPdf ? "" : this.selectedCipher.href,
                cipher_title: isCustomPdf ? (firstPdfPage.detected_title || this.form.name) : this.selectedCipher.title,
                cipher_text: isCustomPdf ? this.pdfPreviewText : "",
                video_image: this.selectedVideo.videoThumbnail,
                music_tags: this.musicTags
            };

            this.savingMusic = true;
            try {
                const response = await api.post("/musicas", data);
                this.$emit("success", response.data.returnObj);
            } catch (error) {
                const message = error.response && error.response.data ? error.response.data.message || error.response.data : "Não foi possível cadastrar a música";
                this.showResponse(message, ".response", "error");
            } finally {
                this.savingMusic = false;
            }
        },
        returnMusicTags: async function () {
            try {
                const response = await api.get("/musicas/tags");
                this.musicTagsList = response.data.returnObj;
            } catch (error) {
                console.log(error);
            }
        }
    },
    mounted: function () {
        this.returnMusicTags();
    }
}
</script>

<style scoped>
.create-music-wizard {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 48vh;
    padding: 6px 4px;
}

/* --- BARRA DE PROGRESSO MOBILE --- */
.progress-tracker {
    margin-bottom: 1.5rem;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--secondary-blue-soft) 0%, var(--primary-primary-blue-high-2) 100%);
    transition: width var(--transition-normal);
}

.step-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}

.step-text {
    font-size: var(--font-size-5);
    font-weight: 700;
    color: var(--secondary-blue-soft);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.step-title {
    font-size: var(--font-size-4);
    font-weight: 600;
    color: var(--neutral-white);
}

/* --- ETAPA 1: GLASS CARD --- */
.glass-form-card {
    position: relative;
    z-index: 10;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 1.2rem;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 1.5rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
}

.form-input-wrapper input {
    padding-left: 44px;
    height: 48px;
    background: rgba(24, 21, 56, 0.45);
    border-color: rgba(255, 255, 255, 0.08);
}

.form-input-wrapper input:focus {
    border-color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}

.field-icon {
    position: absolute;
    left: 14px;
    color: var(--secondary-blue-soft);
    opacity: 0.85;
    pointer-events: none;
    font-size: 20px;
}

/* --- ETAPA 2: BUSCA YOUTUBE --- */
.search-summary-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(24, 21, 56, 0.5);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 10px 14px;
    margin-bottom: 1.2rem;
    backdrop-filter: var(--glass-blur);
}

.search-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.search-meta .material-icons {
    color: var(--secondary-blue-soft);
    font-size: 20px;
    flex-shrink: 0;
}

.search-meta p {
    margin: 0;
    font-size: var(--font-size-4);
    font-weight: 700;
    color: var(--neutral-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist-sep {
    color: var(--neutral-gray-low);
    font-weight: normal;
}

.btn-quick-edit {
    background: transparent;
    border: none;
    color: var(--secondary-blue-soft);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-pill);
    transition: background var(--transition-fast);
}

.btn-quick-edit:hover {
    background: rgba(56, 182, 255, 0.1);
}

/* Scroll Resultados */
.results-scroll-pane {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    padding-right: 4px;
    margin-bottom: 1.5rem;
}

.results-scroll-pane.compact {
    max-height: 34vh;
}

/* Cards de Vídeo (Mobile Friendly) */
.video-card-mobile {
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    background: rgba(24, 21, 56, 0.55);
    overflow: hidden;
    transition: all var(--transition-fast);
}

.video-card-mobile.selected {
    border-color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.05);
    box-shadow: var(--glow-shadow);
}

.card-clickable-area {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    cursor: pointer;
    width: 100%;
}

.video-thumb-pane {
    position: relative;
    width: 100px;
    height: 56px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: #000;
    cursor: zoom-in;
    display: flex;
    align-items: center;
    justify-content: center;
}

.video-thumb-pane img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

/* Overlay com ícone de play */
.thumb-play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    transition: all var(--transition-fast);
}

.video-thumb-pane:hover .thumb-play-overlay {
    background: rgba(0, 0, 0, 0.55);
    opacity: 1;
}

.thumb-play-overlay .material-icons {
    color: var(--neutral-white);
    font-size: 28px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.video-info-pane {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.video-title {
    display: block;
    font-size: var(--font-size-4);
    font-weight: 600;
    color: var(--neutral-white);
    line-height: 1.35;
    white-space: normal;
    word-break: break-word;
}

.video-meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 5px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.video-channel {
    font-weight: 600;
    color: var(--secondary-blue-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.video-meta-sep {
    color: var(--neutral-gray-low);
}

.video-meta-time {
    white-space: nowrap;
}

/* Coluna de Seleção Comum */
.selection-check-column {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding-left: 6px;
}

.select-checkmark {
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    width: 24px;
    color: var(--neutral-gray-low);
    transition: color var(--transition-fast);
}

.select-checkmark.checked {
    color: var(--others-green);
}

/* --- ETAPA 3: CIFRA --- */
.selected-reference-card {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(24, 21, 56, 0.4);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 8px;
    margin-bottom: 1.2rem;
}

.selected-reference-card img {
    width: 58px;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.ref-details {
    min-width: 0;
}

.ref-tag {
    font-size: 10px;
    font-weight: 700;
    color: var(--secondary-blue-soft);
    text-transform: uppercase;
    margin-bottom: 1px;
    display: block;
}

.ref-title {
    margin: 0;
    font-size: var(--font-size-5);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--neutral-gray-high);
}

/* Cards de Cifra (Mobile) */
.cipher-card-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    background: rgba(24, 21, 56, 0.55);
    padding: 10px 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
    gap: 12px;
}

.cipher-card-mobile.selected {
    border-color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.05);
    box-shadow: var(--glow-shadow);
}

.cipher-card-main {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.doc-icon {
    color: var(--secondary-blue-soft);
    font-size: 22px;
}

.cipher-details {
    min-width: 0;
}

.cipher-title {
    display: block;
    font-size: var(--font-size-4);
    font-weight: 600;
    color: var(--neutral-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cipher-provider {
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.cipher-card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.btn-view-site {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--neutral-gray-medium);
    padding: 4px 8px;
    border-radius: var(--radius-pill);
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    transition: all var(--transition-fast);
}

.btn-view-site:hover {
    background: var(--primary-primary-blue-high-2);
    border-color: var(--secondary-blue-soft);
    color: var(--neutral-white) !important;
}

.cipher-source-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    background: rgba(24, 21, 56, 0.45);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 6px;
    margin-bottom: 1.2rem;
}

.source-tab {
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--neutral-gray-medium);
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: var(--font-size-5);
    font-weight: 800;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.source-tab .material-icons {
    font-size: 18px;
}

.source-tab.active {
    background: var(--secondary-blue-soft-2);
    color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}

.pdf-import-pane {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 1.2rem;
}

.pdf-file-input {
    display: none;
}

.pdf-upload-card {
    width: 100%;
    min-height: 76px;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    background: rgba(24, 21, 56, 0.55);
    border: 1.5px dashed rgba(255, 255, 255, 0.16);
    border-radius: var(--radius-md);
    color: var(--neutral-gray-high);
    padding: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.pdf-upload-card:hover,
.pdf-upload-card.selected {
    border-color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.05);
}

.pdf-upload-card > .material-icons {
    font-size: 30px;
    color: var(--secondary-blue-soft);
    flex-shrink: 0;
}

.pdf-upload-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.pdf-upload-copy strong {
    color: var(--neutral-white);
    font-size: var(--font-size-4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pdf-upload-copy small,
.page-copy small {
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
}

.compact-state {
    min-height: 120px;
    padding: 1rem;
}

.pdf-page-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.pdf-page-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    background: rgba(24, 21, 56, 0.55);
    color: var(--neutral-gray-high);
    padding: 10px 12px;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
}

.pdf-page-option.selected {
    border-color: var(--secondary-blue-soft);
    background: rgba(56, 182, 255, 0.05);
}

.pdf-page-option .material-icons {
    color: var(--secondary-blue-soft);
    font-size: 22px;
    flex-shrink: 0;
}

.page-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.page-copy strong {
    color: var(--neutral-white);
    font-size: var(--font-size-4);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pdf-preview-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.pdf-preview-section label {
    color: var(--neutral-gray-high);
    font-size: var(--font-size-5);
    font-weight: 800;
    text-transform: uppercase;
}

.pdf-preview-section textarea {
    width: 100%;
    min-height: 260px;
    max-height: 40vh;
    resize: vertical;
    overflow: auto;
    background: rgba(12, 10, 28, 0.82);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    color: var(--neutral-gray-high-2);
    font-family: Consolas, "Courier New", monospace;
    font-size: 13px;
    line-height: 1.55;
    padding: 14px;
    white-space: pre;
}

.pdf-preview-section textarea:focus {
    outline: none;
    border-color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}

/* Banner de Sucesso */
.ready-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--green-high);
    border: 1px solid rgba(60, 208, 112, 0.2);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    margin-bottom: 1.5rem;
}

.ready-banner .material-icons {
    color: var(--others-green);
    font-size: 24px;
}

.ready-text h6 {
    margin: 0;
    font-size: var(--font-size-4);
    color: var(--neutral-white);
}

.ready-text p {
    margin: 0;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

/* --- ESTADOS GERAIS --- */
.wizard-state-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1rem;
    min-height: 200px;
}

.wizard-state-card h6 {
    margin: 8px 0 4px;
    color: var(--neutral-white);
}

.wizard-state-card p {
    margin: 0;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.spinner-loader {
    width: 28px;
    height: 28px;
    border: 2.5px solid rgba(255, 255, 255, 0.15);
    border-top-color: var(--secondary-blue-soft);
    border-radius: var(--radius-pill);
    animation: spin 0.8s linear infinite;
}

.state-icon {
    font-size: 36px;
    color: var(--secondary-blue-soft);
}

/* --- FOOTER DE NAVEGAÇÃO --- */
.wizard-nav-footer {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 1.2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.wizard-nav-footer button {
    flex: 1;
    max-width: none !important;
    height: 48px;
    font-size: var(--font-size-4);
}

.success-btn {
    background: linear-gradient(135deg, var(--others-green) 0%, #2ba554 100%) !important;
}

.btn-cancel {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.15) !important;
    color: var(--neutral-gray-high) !important;
}

.btn-cancel:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    color: var(--neutral-white) !important;
}

/* --- LIGHTBOX MODAL DE PREVIEW --- */
.youtube-preview-modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn var(--transition-fast) ease-out;
}

.youtube-preview-modal-content {
    width: 92%;
    max-width: 680px;
    position: relative;
    background: #000;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.12);
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75);
}

.btn-close-preview-modal {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all var(--transition-fast);
}

.btn-close-preview-modal:hover {
    background: rgba(241, 76, 76, 0.85);
    border-color: var(--others-red);
}

.iframe-modal-aspect {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
}

.iframe-modal-aspect iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* --- ANIMAÇÕES --- */
@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes slideInUp {
    from { transform: translateY(15px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* Animação de transição de etapa */
.wizard-step-pane {
    animation: slideInUp 0.3s ease-out;
}

/* --- SUPORTE A LANDSCAPE TELA CHEIA --- */
@media (orientation: landscape) {
    .youtube-preview-modal-content {
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        border-radius: 0 !important;
        border: none !important;
    }
    .iframe-modal-aspect {
        width: 100% !important;
        height: 100% !important;
        padding-bottom: 0 !important;
    }
    .iframe-modal-aspect iframe {
        width: 100% !important;
        height: 100% !important;
    }
}
</style>
