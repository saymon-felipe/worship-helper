<template>
    <div class="create-event-modal-content inner-modal-container">
        <form id="new-event-form" @submit.prevent="createEvent($event)">
            <!-- Linha 1: Nome e Data -->
            <div class="form-row-grid">
                <div class="input-group">
                    <label class="section-label">
                        <span class="material-icons">event</span>
                        <span>Nome do evento</span>
                    </label>
                    <input type="text" name="event_name" v-model="eventForm.event_name" placeholder="Ex. Santa Ceia, Culto de Jovens..." maxlength="15" required>
                </div>
                <div class="input-group">
                    <label class="section-label">
                        <span class="material-icons">schedule</span>
                        <span>Dia e Horário</span>
                    </label>
                    <input type="datetime-local" name="event_date" v-model="eventForm.event_date" required>
                </div>
            </div>

            <!-- Seção: Músicas (Repertório) -->
            <div class="event-musics">
                <div class="section-header-inline">
                    <div class="section-header-title">
                        <span class="material-icons">music_note</span>
                        <h5>Repertório do Culto</h5>
                    </div>
                    <button type="button" class="btn-icon-add" @click="openSearchMusic()" title="Adicionar música">
                        <span class="material-icons">add</span>
                    </button>
                </div>

                <div class="music-list-modal">
                    <div class="selected-music-item-card" v-for="(music, index) in event_selected_musics" :key="index">
                        <div class="music-info-side">
                            <img :src="music.image || default_music_image" class="music-mini-avatar" alt="Capa da música">
                            <div class="music-text">
                                <span class="music-title">{{ music.name }}</span>
                                <span class="music-author">{{ music.artist }}</span>
                            </div>
                        </div>
                        <div class="music-right-side">
                            <button type="button" class="tone-tag-badge tone-button" v-if="music.tone" @click="editMusicTone(music)" title="Alterar tom">
                                {{ music.tone.nome }}
                            </button>
                            <button type="button" class="btn-remove-music" @click="removeMusic(music)" title="Remover música">
                                <span class="material-icons">close</span>
                            </button>
                        </div>
                    </div>
                    <div class="empty-music-state" v-if="event_selected_musics.length === 0">
                        <span class="material-icons">playlist_add</span>
                        <p>Nenhuma música adicionada ainda. Clique no "+" acima para escolher.</p>
                    </div>
                </div>
            </div>

            <!-- Seção: Escala de Integrantes -->
            <div class="event-members">
                <div class="section-header-inline">
                    <div class="section-header-title">
                        <span class="material-icons">groups</span>
                        <h5>Escala de Integrantes</h5>
                    </div>
                    <button type="button" class="btn-icon-add" @click="openSearchMember()" title="Adicionar Integrante">
                        <span class="material-icons">add</span>
                    </button>
                </div>

                <!-- Lista de Integrantes Adicionados -->
                <div class="members-added-list">
                    <div class="added-member-row" v-for="(member, index) in event_selected_members" :key="index">
                        <div class="member-profile-side">
                            <img :src="member.imagem_usuario || default_avatar" class="avatar-pp" alt="Avatar">
                            <div class="member-meta">
                                <span class="member-name">{{ member.nome_usuario }}</span>
                                <span class="member-role-tag">{{ member.nome_funcao }}</span>
                            </div>
                        </div>
                        <button type="button" class="btn-remove-member" @click="removeMember(member.id_usuario)" title="Remover integrante">
                            <span class="material-icons">close</span>
                        </button>
                    </div>
                    <div class="empty-members-state" v-if="event_selected_members.length === 0">
                        <span class="material-icons">person_add</span>
                        <p>Nenhum integrante adicionado à escala ainda. Clique no "+" acima para escolher.</p>
                    </div>
                </div>
            </div>

            <input type="submit" id="submit-informations-form" style="display: none;">
        </form>

        <p class="response">{{ response }}</p>
        
        <!-- SUB-TELA: Escolher Música -->
        <Transition name="route">
            <searchMusic v-if="showSearchMusic" @select="selectMusic($event)" @close="showSearchMusic = false" />
        </Transition>
        <Transition name="route">
            <musicDetails v-if="toneEditMusic" :music="toneEditMusic" @select="updateMusicTone($event)" @close="toneEditMusic = null" />
        </Transition>

        <!-- SUB-TELA: Escolher Membros da Igreja -->
        <Transition name="route">
            <div class="member-picker-overlay" v-if="showSearchMember">
                <div class="preview-buttons">
                    <button type="button" class="btn" @click="closeSearchMember()">Voltar</button>
                    <button type="button" class="btn primary" @click="confirmSelectedMembers()">Confirmar Escala ({{ tempSelectedMembers.length }})</button>
                </div>
                <div class="search-member-box-large">
                    <span class="material-icons">search</span>
                    <input type="text" v-model="memberSearchQuery" placeholder="Filtrar integrantes pelo nome...">
                </div>
                <div class="member-selection-list">
                    <div 
                        class="selectable-member-card" 
                        v-for="(member, index) in filteredChurchMembers" 
                        :key="index"
                        @click="toggleTempMemberSelect(member)"
                        :class="{ 'selected': isTempMemberSelected(member) }"
                    >
                        <img :src="member.imagem_usuario || default_avatar" class="member-avatar" alt="Avatar">
                        <div class="member-info">
                            <h6>{{ member.nome_usuario }}</h6>
                            <!-- Caso esteja selecionado, exibe seletor de função inline -->
                            <div class="role-selector-inline" v-if="isTempMemberSelected(member)" @click.stop>
                                <label>Função:</label>
                                <select :value="getTempMemberFunctionId(member)" @change="setTempMemberFunction(member, $event.target.value)">
                                    <option v-for="fun in churchFunctions" :key="fun.id_funcao" :value="fun.id_funcao">
                                        {{ fun.nome_funcao }}
                                    </option>
                                </select>
                            </div>
                            <p v-else class="member-desc">{{ member.descricao_usuario || 'Integrante' }}</p>
                        </div>
                        <span class="material-icons select-badge">
                            {{ isTempMemberSelected(member) ? 'check_circle' : 'radio_button_unchecked' }}
                        </span>
                    </div>
                    <div class="empty-members" v-if="loadingChurchMembers">
                        <p>Carregando integrantes...</p>
                    </div>
                    <div class="empty-members" v-else-if="membersLoadError">
                        <p>{{ membersLoadError }}</p>
                    </div>
                    <div class="empty-members" v-else-if="filteredChurchMembers.length === 0">
                        <p>Nenhum integrante encontrado</p>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script>
import { globalMethods } from '../js/globalMethods';
import searchMusic from "./searchMusic.vue";
import musicDetails from "./musicDetails.vue";
import api from '../config/api';
import moment from 'moment';
import { appStore } from '../store/appStore';

export default {
    name: "createEventModalContent",
    mixins: [globalMethods],
    props: ["eventToEdit"],
    data() {
        return {
            eventForm: {
                event_name: "",
                event_date: ""
            },
            event_selected_members: [],
            event_selected_musics: [],
            showSearchMusic: false,
            toneEditMusic: null,
            churchFunctions: [],
            churchMembers: [],
            churchMembersLoaded: false,
            loadingChurchMembers: false,
            membersLoadError: "",
            memberSearchQuery: "",
            showSearchMember: false,
            tempSelectedMembers: [],
            default_avatar: api.defaults.baseURL + "/public/user-default-image.png",
            default_music_image: api.defaults.baseURL + "/public/music-default-image.png"
        }
    },
    computed: {
        filteredChurchMembers: function () {
            const members = Array.isArray(this.churchMembers) ? this.churchMembers : [];
            if (!this.memberSearchQuery) {
                return members;
            }
            const q = this.memberSearchQuery.toLowerCase().trim();
            return members.filter(m => String(m.nome_usuario || "").toLowerCase().includes(q));
        }
    },
    methods: {
        removeMusic: function (music) {
            this.event_selected_musics = this.event_selected_musics.filter(obj => obj.id != music.id);
        },
        selectMusic: function (music) {
            const exists = this.event_selected_musics.some(m => m.id === music.id);
            if (!exists) {
                this.event_selected_musics.push(music);
            }
            this.showSearchMusic = false;
        },
        openSearchMusic: function () {
            this.showSearchMusic = true;
        },
        createEvent: function (event) {
            let self = this;

            if (this.event_selected_members.length == 0) {
                this.showResponse("Nenhum membro selecionado", ".response", "error");
                return;
            }

            if (this.event_selected_musics.length == 0) {
                this.showResponse("Nenhuma música selecionada", ".response", "error");
                return;
            }

            let data = Object.fromEntries(new FormData(event.target).entries());

            if (data.event_name.trim() == "") {
                this.showResponse("Nome inválido", ".response", "error");
                return;
            }

            data["event_members"] = this.event_selected_members;
            data["event_musics"] = this.event_selected_musics;
            data["id_igreja"] = this.getCurrentChurchId();

            const path = this.isEditingEvent()
                ? "/igreja/atualizar-evento/" + this.eventToEdit.id_evento
                : "/igreja/cadastrar-evento";

            api.post(path, data)
            .then(function () {
                self.$emit("success");
            })
            .catch(function (error) {
                console.log(error);
            })
        },
        removeMember: function (member_id) {
            this.event_selected_members = this.event_selected_members.filter(member => member.id_usuario != member_id);
        },
        openSearchMember: function () {
            this.memberSearchQuery = "";
            this.membersLoadError = "";
            // Clona a lista atual para a lista temporária
            this.tempSelectedMembers = JSON.parse(JSON.stringify(this.event_selected_members));
            this.showSearchMember = true;
            this.loadChurchMembers();
        },
        closeSearchMember: function () {
            this.showSearchMember = false;
        },
        isTempMemberSelected: function (member) {
            return this.tempSelectedMembers.some(m => m.id_usuario === member.id_usuario);
        },
        toggleTempMemberSelect: function (member) {
            const idx = this.tempSelectedMembers.findIndex(m => m.id_usuario === member.id_usuario);
            if (idx !== -1) {
                this.tempSelectedMembers.splice(idx, 1);
            } else {
                const defaultFun = this.churchFunctions[0] || { id_funcao: 0, nome_funcao: "Nenhuma" };
                this.tempSelectedMembers.push({
                    id_usuario: member.id_usuario,
                    nome_usuario: member.nome_usuario,
                    imagem_usuario: member.imagem_usuario,
                    id_funcao: defaultFun.id_funcao,
                    nome_funcao: defaultFun.nome_funcao
                });
            }
        },
        getTempMemberFunctionId: function (member) {
            const found = this.tempSelectedMembers.find(m => m.id_usuario === member.id_usuario);
            return found ? found.id_funcao : "";
        },
        setTempMemberFunction: function (member, functionId) {
            const found = this.tempSelectedMembers.find(m => m.id_usuario === member.id_usuario);
            if (found) {
                const fun = this.churchFunctions.find(f => f.id_funcao == functionId);
                if (fun) {
                    found.id_funcao = fun.id_funcao;
                    found.nome_funcao = fun.nome_funcao;
                }
            }
        },
        confirmSelectedMembers: function () {
            this.event_selected_members = [...this.tempSelectedMembers];
            this.showSearchMember = false;
        },
        syncChurchMembersFromStore: function () {
            const churchId = this.getCurrentChurchId();
            const storeHasMembers = this.igreja
                && (!churchId || this.igreja.id_igreja == churchId)
                && Array.isArray(this.igreja.membros);
            this.churchMembers = storeHasMembers ? this.igreja.membros : [];
            this.churchMembersLoaded = Boolean(storeHasMembers);
        },
        loadChurchMembers: function () {
            const churchId = this.getCurrentChurchId();

            if (!churchId) {
                this.syncChurchMembersFromStore();
                return Promise.resolve(this.churchMembers);
            }

            if (this.churchMembersLoaded) {
                return Promise.resolve(this.churchMembers);
            }

            this.loadingChurchMembers = true;
            this.membersLoadError = "";

            return api.post("/igreja/retorna-membros", { id_igreja: churchId })
                .then((response) => {
                    const members = response.data && Array.isArray(response.data.returnObj)
                        ? response.data.returnObj
                        : [];

                    this.churchMembers = members;
                    this.churchMembersLoaded = true;

                    if (this.igreja && this.igreja.id_igreja == churchId) {
                        appStore.setChurch({
                            ...this.igreja,
                            membros: members,
                            quantidade_membros: members.length
                        });
                    }

                    return members;
                })
                .catch((error) => {
                    console.log(error);
                    this.membersLoadError = "Nao foi possivel carregar os integrantes";
                    return [];
                })
                .finally(() => {
                    this.loadingChurchMembers = false;
                });
        },
        loadChurchFunctions: function () {
            let self = this;
            let churchId = self.getCurrentChurchId();
            if (!churchId) return;

            api.post("/igreja/retorna-funcoes", { id_igreja: churchId })
                .then(function (response) {
                    self.churchFunctions = response.data.returnObj || [];
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        isEditingEvent: function () {
            return Boolean(this.eventToEdit && this.eventToEdit.id_evento);
        },
        editMusicTone: function (music) {
            this.toneEditMusic = { ...music };
        },
        updateMusicTone: function (tone) {
            const found = this.event_selected_musics.find((music) => music.id === this.toneEditMusic.id);
            if (found) {
                found.tone = tone;
            }
            this.toneEditMusic = null;
        },
        fillEventToEdit: function () {
            if (!this.isEditingEvent()) {
                return;
            }

            this.eventForm.event_name = this.eventToEdit.nome_evento || "";
            this.eventForm.event_date = this.eventToEdit.data_inicio_evento
                ? moment(this.eventToEdit.data_inicio_evento).format("YYYY-MM-DDTHH:mm")
                : "";

            const members = Array.isArray(this.eventToEdit.membros_evento) ? this.eventToEdit.membros_evento : [];
            this.event_selected_members = members.map((member) => ({
                id_usuario: member.id_usuario,
                nome_usuario: member.nome_usuario,
                imagem_usuario: member.imagem_usuario,
                id_funcao: member.id_funcao,
                nome_funcao: member.user_occupation
            }));

            const musics = Array.isArray(this.eventToEdit.musicas) ? this.eventToEdit.musicas : [];
            this.event_selected_musics = musics.map((music) => ({
                id: music.id_musica,
                name: music.nome_musica,
                artist: music.artista_musica,
                image: music.imagem_musica,
                tone: {
                    id: music.id_tom,
                    nome: music.tom
                }
            }));
        }
    },
    components: {
        searchMusic,
        musicDetails
    },
    mounted: function () {
        this.syncChurchMembersFromStore();
        this.loadChurchFunctions();
        this.fillEventToEdit();
    }
}
</script>

<style scoped>
.create-event-modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-row-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

@media (max-width: 560px) {
    .form-row-grid {
        grid-template-columns: 1fr;
    }
}

.section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: var(--font-size-5);
    font-weight: 700;
    color: var(--neutral-gray-high);
}

.section-label span.material-icons {
    font-size: 18px;
    color: var(--secondary-blue-soft);
}

/* --- CABEÇALHOS INTERNOS --- */
.section-header-inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 6px;
}

.section-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-header-title span {
    font-size: 20px;
    color: var(--secondary-blue-soft);
}

.section-header-title h5 {
    margin: 0;
    font-size: var(--font-size-4);
    font-weight: 700;
    color: var(--neutral-white);
}

.btn-icon-add {
    background: rgba(56, 182, 255, 0.1);
    border: 1px solid rgba(56, 182, 255, 0.25);
    color: var(--secondary-blue-soft);
    width: 32px;
    height: 32px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-icon-add:hover {
    background: var(--secondary-blue-soft);
    color: var(--neutral-white);
    box-shadow: 0 0 10px rgba(56, 182, 255, 0.3);
}

/* --- REPERTÓRIO (MÚSICAS) --- */
.music-list-modal {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.selected-music-item-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    transition: background var(--transition-fast);
}

.selected-music-item-card:hover {
    background: rgba(255, 255, 255, 0.06);
}

.music-info-side {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.music-mini-avatar {
    width: 36px;
    height: 36px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.music-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.music-title {
    font-size: var(--font-size-4);
    font-weight: 600;
    color: var(--neutral-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-author {
    font-size: 11px;
    color: var(--neutral-gray-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-right-side {
    display: flex;
    align-items: center;
    gap: 12px;
}

.tone-tag-badge {
    background: var(--secondary-blue-soft-2);
    border: 1px solid rgba(56, 182, 255, 0.25);
    color: var(--secondary-blue-soft);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
}

.tone-button {
    cursor: pointer;
}

.btn-remove-music, .btn-remove-member {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--neutral-gray-low);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-pill);
    transition: all var(--transition-fast);
}

.btn-remove-music:hover, .btn-remove-member:hover {
    background: rgba(241, 76, 76, 0.12);
    color: var(--others-red);
}

.btn-remove-music span, .btn-remove-member span {
    font-size: 16px;
}

.empty-music-state, .empty-members-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 1.5rem;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.01);
    color: var(--neutral-gray-medium);
}

.empty-music-state span, .empty-members-state span {
    font-size: 24px;
}

.empty-music-state p, .empty-members-state p {
    margin: 0;
    font-size: var(--font-size-5);
}

/* --- LISTA DE INTEGRANTES ADICIONADOS --- */
.members-added-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.added-member-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    padding: 8px 12px;
}

.member-profile-side {
    display: flex;
    align-items: center;
    gap: 12px;
}

.member-meta {
    display: flex;
    flex-direction: column;
}

.member-name {
    font-size: var(--font-size-4);
    font-weight: 600;
    color: var(--neutral-white);
}

.member-role-tag {
    font-size: 11px;
    color: var(--others-green);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
}

/* --- SUB-TELA: SELETOR DE MEMBROS (OVERLAY) --- */
.member-picker-overlay {
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
    background: var(--primary-primary-blue-low);
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.search-member-box-large {
    position: relative;
    display: flex;
    align-items: center;
    margin: 1rem 0;
}

.search-member-box-large span {
    position: absolute;
    left: 12px;
    color: var(--neutral-gray-medium);
    font-size: 20px;
    pointer-events: none;
}

.search-member-box-large input {
    width: 100%;
    height: 44px;
    padding-left: 44px;
    padding-right: 12px;
    background: rgba(24, 21, 56, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-sm);
    color: var(--neutral-white);
    outline: none;
    font-size: var(--font-size-4);
    transition: all var(--transition-fast);
}

.search-member-box-large input:focus {
    border-color: var(--secondary-blue-soft);
    box-shadow: var(--glow-shadow);
}

.member-selection-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 4px;
}

.selectable-member-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.selectable-member-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
}

.selectable-member-card.selected {
    background: rgba(56, 182, 255, 0.04);
    border-color: rgba(56, 182, 255, 0.25);
}

.member-avatar {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
}

.selectable-member-card.selected .member-avatar {
    border-color: var(--secondary-blue-soft);
}

.member-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.member-info h6 {
    margin: 0;
    font-size: var(--font-size-4);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-desc {
    margin: 0;
    font-size: 11px;
    color: var(--neutral-gray-medium);
}

.role-selector-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--neutral-gray-high);
}

.role-selector-inline select {
    background: rgba(24, 21, 56, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-white);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: 11px;
    outline: none;
    cursor: pointer;
}

.select-badge {
    color: var(--neutral-gray-low);
    font-size: 24px;
    transition: color var(--transition-fast);
    flex-shrink: 0;
}

.selectable-member-card.selected .select-badge {
    color: var(--secondary-blue-soft);
}

.empty-members {
    text-align: center;
    padding: 2rem;
    color: var(--neutral-gray-medium);
}

.response {
    text-align: center;
    margin-top: 0.5rem;
}
</style>

