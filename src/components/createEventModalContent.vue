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
                    <input type="datetime-local" name="event_date" v-model="eventForm.event_date" :min="minimumEventDate" required>
                </div>
            </div>

            <!-- Linha 2: Local (opcional; o endereço só é pedido, e obrigatório, com o switch marcado) -->
            <div class="event-location">
                <label class="location-toggle">
                    <input type="checkbox" :checked="eventForm.has_location" @change="setHasLocation($event.target.checked)">
                    <span class="location-toggle-track" aria-hidden="true"><span></span></span>
                    <span class="location-toggle-text">
                        <span class="material-icons">place</span>
                        <span>{{ eventForm.has_location ? "Evento com local definido" : "Informar o local do evento" }}</span>
                    </span>
                </label>
                <div class="location-fields" v-if="eventForm.has_location">
                    <div class="input-group location-field">
                        <label class="section-label" for="event-cep">
                            <span class="material-icons">pin_drop</span>
                            <span>CEP (opcional)</span>
                        </label>
                        <input type="text" id="event-cep" ref="cepInput" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000" :value="eventForm.cep_evento" :class="{ 'invalid-field': cepError }" :aria-invalid="cepError ? 'true' : 'false'" @input="onCepInput($event)">
                        <span class="field-hint" role="status" v-if="cepStatus">{{ cepStatus }}</span>
                        <span class="field-error" role="alert" v-if="cepError">{{ cepError }}</span>
                    </div>
                    <div class="input-group location-field">
                        <label class="section-label" for="event-location">
                            <span class="material-icons">map</span>
                            <span>Endereço / Local</span>
                        </label>
                        <input type="text" id="event-location" ref="locationInput" v-model="eventForm.local_evento" placeholder="Ex. Rua das Flores, 123 - Centro" maxlength="255" :class="{ 'invalid-field': locationError }" :aria-invalid="locationError ? 'true' : 'false'" @input="locationError = ''" @blur="onAddressBlur($event)">
                        <span class="field-error" role="alert" v-if="locationError">{{ locationError }}</span>
                    </div>
                    <div class="location-map-block">
                        <div class="map-slot">
                            <eventLocationMap :latitude="eventForm.latitude_evento" :longitude="eventForm.longitude_evento" editable height="100%" @change="onPinChange($event)" />
                        </div>
                        <div class="map-toolbar">
                            <span class="map-status" :class="mapStatus.type" role="status">{{ mapStatus.text || "Toque no mapa ou arraste o pino para marcar a posição." }}</span>
                            <button type="button" class="btn-locate" :disabled="locating || (!eventForm.local_evento.trim() && !cepInfo)" @click="locateOnMap(true)" title="Localizar o endereço no mapa">
                                <span class="material-icons">my_location</span>
                                <span>Localizar</span>
                            </button>
                        </div>
                    </div>
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

        <feedbackModal
            :show="showInvalidDateModal"
            title="Data inválida"
            message="A data do evento não pode ser anterior a hoje. Escolha uma data a partir de hoje para continuar."
            @close="showInvalidDateModal = false"
        />
        
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
import { defineAsyncComponent } from 'vue';
import { globalMethods } from '../js/globalMethods';
import searchMusic from "./searchMusic.vue";
import musicDetails from "./musicDetails.vue";
import api from '../config/api';
import moment from 'moment';
import { appStore } from '../store/appStore';
import feedbackModal from "./feedbackModal.vue";
import { buildAddressFromCep, fetchAddressByCep, formatCep, locateAddress, onlyDigits } from '../services/geocoding';

const LOCATION_MAX_LENGTH = 255;

// O mapa (Leaflet) so e baixado quando o modal abre com o switch de local marcado.
const eventLocationMap = defineAsyncComponent(() => import("./eventLocationMap.vue"));

const MAP_MESSAGES = {
    address: { text: "Pino posicionado pelo endereço. Arraste-o ou toque no mapa para ajustar.", type: "ok" },
    street: { text: "Encontramos a rua, mas não o número. Arraste o pino até o local exato.", type: "warn" },
    city: { text: "Encontramos só a cidade. Arraste o pino até o local exato.", type: "warn" },
    notFound: { text: "Não encontramos esse endereço no mapa. Toque no mapa ou arraste o pino para marcar a posição.", type: "warn" },
    unavailable: { text: "Não foi possível consultar o mapa agora. Toque no mapa para marcar a posição do pino.", type: "warn" },
    manual: { text: "Posição do pino ajustada.", type: "ok" }
};

export default {
    name: "createEventModalContent",
    mixins: [globalMethods],
    props: ["eventToEdit"],
    data() {
        return {
            eventForm: {
                event_name: "",
                event_date: "",
                has_location: false,
                local_evento: "",
                cep_evento: "",
                latitude_evento: null,
                longitude_evento: null
            },
            locationError: "",
            cepError: "",
            cepStatus: "",
            cepInfo: null,
            mapStatus: { text: "", type: "" },
            locating: false,
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
            showInvalidDateModal: false,
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
        },
        minimumEventDate: function () {
            return moment().startOf("day").format("YYYY-MM-DDTHH:mm");
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

            if (moment(this.eventForm.event_date).isBefore(moment().startOf("day"))) {
                this.showInvalidDateModal = true;
                return;
            }

            const location = this.eventForm.local_evento.trim();
            const cepDigits = onlyDigits(this.eventForm.cep_evento);

            if (this.eventForm.has_location && cepDigits != "" && cepDigits.length != 8) {
                this.cepError = "CEP incompleto. Use o formato 00000-000";
                this.focusField("cepInput");
                return;
            }

            if (this.eventForm.has_location && location == "") {
                this.locationError = "Informe o endereço do evento ou desmarque a opção de local";
                this.focusField("locationInput");
                return;
            }

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
            data["tem_local"] = this.eventForm.has_location;

            if (this.eventForm.has_location) {
                const hasPin = this.hasPin();

                data["local_evento"] = location;
                data["cep_evento"] = cepDigits || null;
                data["latitude_evento"] = hasPin ? this.eventForm.latitude_evento : null;
                data["longitude_evento"] = hasPin ? this.eventForm.longitude_evento : null;
            }

            const path = this.isEditingEvent()
                ? "/igreja/atualizar-evento/" + this.eventToEdit.id_evento
                : "/igreja/cadastrar-evento";

            api.post(path, data)
            .then(function (response) {
                self.$emit("success", response.data.returnObj);
            })
            .catch(function (error) {
                console.log(error);
                self.showResponse(error.response && error.response.data, ".response", "error");
            })
        },
        focusField: function (refName) {
            this.$nextTick(() => {
                if (this.$refs[refName]) {
                    this.$refs[refName].focus();
                }
            });
        },
        hasPin: function () {
            return Number.isFinite(this.eventForm.latitude_evento) && Number.isFinite(this.eventForm.longitude_evento);
        },
        resetLocation: function () {
            // Invalida buscas de CEP/mapa em andamento: o resultado delas nao deve cair num local que ja foi limpo.
            this.cepToken++;
            this.locateToken++;
            this.eventForm.local_evento = "";
            this.eventForm.cep_evento = "";
            this.eventForm.latitude_evento = null;
            this.eventForm.longitude_evento = null;
            this.locationError = "";
            this.cepError = "";
            this.cepStatus = "";
            this.cepInfo = null;
            this.mapStatus = { text: "", type: "" };
            this.locating = false;
            this.lastAutofilledAddress = "";
            this.lastLocatedAddress = "";
        },
        setHasLocation: function (enabled) {
            this.eventForm.has_location = enabled;

            if (!enabled) {
                this.resetLocation();
                return;
            }

            this.locationError = "";
            this.focusField("cepInput");
        },
        onCepInput: function (event) {
            const formatted = formatCep(event.target.value);
            const digits = onlyDigits(formatted);

            // Letras e excesso digitados saem na hora, o campo fica sempre no formato 00000-000.
            event.target.value = formatted;
            this.eventForm.cep_evento = formatted;
            this.cepError = "";
            this.cepStatus = "";
            this.cepInfo = null;
            this.cepToken++;

            if (digits.length == 8) {
                this.lookupCep(digits);
            }
        },
        lookupCep: async function (digits) {
            const token = ++this.cepToken;
            this.cepStatus = "Buscando CEP...";

            try {
                const info = await fetchAddressByCep(digits);
                if (token !== this.cepToken) {
                    return;
                }

                this.cepStatus = "";

                if (!info) {
                    this.cepError = "CEP não encontrado. Confira o número ou preencha o endereço manualmente.";
                    return;
                }

                this.cepInfo = info;

                // So preenche o endereco quando esta vazio ou ainda e o texto que o proprio CEP preencheu; nunca sobrescreve o que a pessoa digitou.
                const current = this.eventForm.local_evento.trim();
                if (current == "" || current == this.lastAutofilledAddress) {
                    const address = buildAddressFromCep(info).slice(0, LOCATION_MAX_LENGTH);
                    this.eventForm.local_evento = address;
                    this.lastAutofilledAddress = address;
                    this.locationError = "";
                }

                this.locateOnMap(true);
            } catch (error) {
                if (token !== this.cepToken) {
                    return;
                }

                console.log(error);
                this.cepStatus = "";
                this.cepError = "Não foi possível buscar o CEP agora. Preencha o endereço manualmente.";
            }
        },
        onAddressBlur: function (event) {
            const address = this.eventForm.local_evento.trim();
            const clickedLocate = event && event.relatedTarget && event.relatedTarget.classList.contains("btn-locate");

            if (address != "" && address != this.lastLocatedAddress && !clickedLocate) {
                this.locateOnMap(true);
            }
        },
        locateOnMap: async function (force = false) {
            const address = this.eventForm.local_evento.trim();

            if ((address == "" && !this.cepInfo) || (!force && address == this.lastLocatedAddress)) {
                return;
            }

            const token = ++this.locateToken;
            this.lastLocatedAddress = address;
            this.locating = true;
            this.mapStatus = { text: "Localizando no mapa...", type: "info" };

            try {
                const result = await locateAddress({ address: address, cepInfo: this.cepInfo });
                if (token !== this.locateToken) {
                    return;
                }

                if (!result) {
                    this.mapStatus = MAP_MESSAGES.notFound;
                    return;
                }

                this.eventForm.latitude_evento = result.latitude;
                this.eventForm.longitude_evento = result.longitude;
                this.mapStatus = MAP_MESSAGES[result.precision];
            } catch (error) {
                if (token !== this.locateToken) {
                    return;
                }

                console.log(error);
                this.lastLocatedAddress = "";
                this.mapStatus = MAP_MESSAGES.unavailable;
            } finally {
                if (token === this.locateToken) {
                    this.locating = false;
                }
            }
        },
        onPinChange: function (position) {
            // Ajuste manual vale mais que a busca automatica: cancela uma busca em andamento para ela nao mover o pino de volta.
            this.locateToken++;
            this.locating = false;
            this.eventForm.latitude_evento = position.latitude;
            this.eventForm.longitude_evento = position.longitude;
            this.mapStatus = MAP_MESSAGES.manual;
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

            const location = String(this.eventToEdit.local_evento || "").trim();
            this.eventForm.has_location = location != "";
            this.eventForm.local_evento = location;
            this.eventForm.cep_evento = formatCep(this.eventToEdit.cep_evento);

            const hasPin = Number.isFinite(this.eventToEdit.latitude_evento) && Number.isFinite(this.eventToEdit.longitude_evento);
            this.eventForm.latitude_evento = hasPin ? this.eventToEdit.latitude_evento : null;
            this.eventForm.longitude_evento = hasPin ? this.eventToEdit.longitude_evento : null;

            // Com pino salvo, sair do campo sem mexer no endereco nao deve buscar de novo e mover o pino.
            this.lastLocatedAddress = hasPin ? location : "";

            // Reaproveita a cidade/UF do CEP salvo para melhorar uma nova busca no mapa (se falhar, a busca segue sem isso).
            if (this.eventForm.has_location && onlyDigits(this.eventForm.cep_evento).length == 8) {
                const token = this.cepToken;
                fetchAddressByCep(this.eventForm.cep_evento).then((info) => {
                    if (info && token === this.cepToken) {
                        this.cepInfo = info;
                    }
                }).catch((error) => console.log(error));
            }

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
        musicDetails,
        feedbackModal,
        eventLocationMap
    },
    created: function () {
        // Controle de buscas em andamento (a resposta de uma busca antiga e descartada) e dos textos que ja foram resolvidos.
        // Nao ficam no data() de proposito: nao precisam ser reativos.
        this.cepToken = 0;
        this.locateToken = 0;
        this.lastAutofilledAddress = "";
        this.lastLocatedAddress = "";
    },
    beforeUnmount: function () {
        this.cepToken++;
        this.locateToken++;
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

/* --- LOCAL DO EVENTO (SWITCH + ENDEREÇO) --- */
.event-location {
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}

.location-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    cursor: pointer;
    color: var(--neutral-gray-high);
    font-size: var(--font-size-4);
}

.location-toggle input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.location-toggle-track {
    width: 46px;
    height: 26px;
    border-radius: var(--radius-pill);
    padding: 3px;
    display: flex;
    align-items: center;
    background: var(--neutral-gray-low);
    transition: background var(--transition-fast);
    flex-shrink: 0;
}

.location-toggle-track span {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--neutral-white);
    transition: transform var(--transition-fast);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.location-toggle input:checked + .location-toggle-track {
    background: var(--primary-primary-blue-high-2);
}

.location-toggle input:checked + .location-toggle-track span {
    transform: translateX(20px);
}

.location-toggle input:focus-visible + .location-toggle-track {
    box-shadow: var(--glow-shadow);
}

.location-toggle-text {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
}

.location-toggle-text span.material-icons {
    font-size: 18px;
    color: var(--secondary-blue-soft);
}

.location-field {
    margin-top: 12px;
}

.location-field input.invalid-field,
.location-field input.invalid-field:focus {
    border-color: var(--others-red);
}

.field-error {
    color: var(--others-red);
    font-size: var(--font-size-5);
    margin-left: 4px;
}

.field-hint {
    color: var(--neutral-gray-medium);
    font-size: var(--font-size-5);
    margin-left: 4px;
}

.location-fields {
    display: flex;
    flex-direction: column;
}

.location-map-block {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.map-slot {
    height: 240px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.03);
}

.map-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.map-status {
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
    line-height: 1.4;
}

.map-status.ok {
    color: var(--others-green);
}

.map-status.warn {
    color: var(--others-yellow);
}

.btn-locate {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    border: 1px solid rgba(56, 182, 255, 0.25);
    background: rgba(56, 182, 255, 0.1);
    color: var(--secondary-blue-soft);
    font-size: var(--font-size-5);
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-locate span.material-icons {
    font-size: 16px;
}

.btn-locate:hover:not(:disabled) {
    background: var(--secondary-blue-soft);
    color: var(--neutral-white);
}

.btn-locate:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

