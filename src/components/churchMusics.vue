<template>
    <div class="church-music">
        <div class="church-profile" v-if="igreja.id_igreja && igreja.id_igreja == getCurrentChurchId()">
            <img :src="igreja.imagem_igreja || default_church_image" class="avatar-p">
            <div class="church-informations">
                <h5>{{ igreja.nome_igreja }}</h5>
                <p v-if="igreja.quantidade_membros !== undefined && igreja.quantidade_membros !== null">
                    <span class="material-icons" style="font-size: 16px;">people</span>
                    <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                </p>
            </div>
        </div>
        <div class="configuration-header">
            <h3>Acervo de músicas</h3>
            <button class="create-new-tag" v-on:click="createMusic()" v-if="canCreateMusic">
                <span class="material-icons">add</span>
            </button>
        </div>

        <!-- Filtros do Acervo -->
        <div class="music-filters-wrapper">
            <div class="search-bar-row">
                <div class="search-input-field">
                    <span class="material-icons search-icon">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou artista..." 
                        v-model="searchQuery"
                        class="search-input"
                    >
                    <span 
                        class="material-icons clear-icon" 
                        v-if="searchQuery" 
                        @click="searchQuery = ''"
                    >close</span>
                </div>
                <button 
                    type="button" 
                    class="btn-advanced-filter" 
                    :class="{ active: showAdvancedFilters || selectedTags.length > 0 }" 
                    @click="toggleAdvancedFilters()"
                    title="Filtro avançado por tags"
                >
                    <span class="material-icons">tune</span>
                    <span class="badge-dot" v-if="selectedTags.length > 0"></span>
                </button>
            </div>

            <!-- Painel de Filtro Avançado por Tags -->
            <Transition name="expand">
                <div class="advanced-filters-panel" v-if="showAdvancedFilters">
                    <div class="panel-header">
                        <h6>Filtrar por estilos (tags)</h6>
                        <button 
                            type="button" 
                            class="btn-clear-tags" 
                            v-if="selectedTags.length > 0" 
                            @click="clearSelectedTags()"
                        >
                            Limpar filtros
                        </button>
                    </div>
                    <div class="tags-cloud">
                        <button 
                            v-for="tag in allTags" 
                            :key="tag.id" 
                            type="button"
                            class="filter-tag-chip"
                            :class="{ selected: isTagSelected(tag) }"
                            @click="toggleTagSelection(tag)"
                        >
                            <span>{{ tag.nome }}</span>
                            <span class="material-icons chip-check" v-if="isTagSelected(tag)">check</span>
                        </button>
                    </div>
                </div>
            </Transition>
        </div>

        <skeletonLoader v-if="isLoading" type="music-card" :count="4" />
        <template v-else>
            <div class="music-list" v-if="filteredMusics.length > 0">
                <musicComponent v-for="(music, index) in filteredMusics" :key="index" :music="music" detail-source="library"></musicComponent>
            </div>
            <div class="musics-empty-state" v-else>
                <span class="material-icons empty-icon">library_music</span>
                <h5>Nenhuma música encontrada</h5>
                <p>Tente ajustar a busca ou limpar os filtros de tags selecionados.</p>
            </div>
        </template>

        <Teleport to="body">
            <Transition name="modal-fade">
                <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="submitForm(); returnMusics();">
                    <createMusicModalContent @success="closeModal(); returnMusics();" />
                </modal>
            </Transition>
        </Teleport>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import musicComponent from "./musicComponent.vue";
import createMusicModalContent from "./createMusicModalContent.vue";
import modal from "./modal.vue";
import skeletonLoader from "./skeletonLoader.vue";
import api from '../config/api';

export default {
    name: "churchMusic",
    mixins: [globalMethods],
    data() {
        return {
            isLoading: true,
            musics: [],
            searchQuery: "",
            showAdvancedFilters: false,
            selectedTags: [],
            allTags: []
        }
    },
    computed: {
        canCreateMusic: function () {
            return this.haveAppPermission || this.hasChurchPermission("music.create");
        },
        filteredMusics: function () {
            let result = this.musics;

            // Filtro por nome ou artista
            if (this.searchQuery && this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase().trim();
                result = result.filter(music => 
                    (music.name && music.name.toLowerCase().includes(query)) ||
                    (music.artist && music.artist.toLowerCase().includes(query))
                );
            }

            // Filtro por tags
            if (this.selectedTags && this.selectedTags.length > 0) {
                const selectedTagIds = this.selectedTags.map(t => t.id);
                result = result.filter(music => {
                    if (!music.tags || music.tags.length === 0) return false;
                    return selectedTagIds.every(tagId => music.tags.some(t => t.id === tagId));
                });
            }

            return result;
        }
    },
    methods: {
        goToLibrary: function () {
            this.$router.push("/home/music-library");
        },
        createMusic: function () {
            this.showModal = true;
            this.modalTitle = "Adicionar música";
            this.modalButtonTitle = "";
        },
        returnMusics: function () {
            let self = this;

            self.isLoading = true;
            api.get("/musicas", { params: { id_igreja: this.getCurrentChurchId() } })
                .then(function (response) {
                    self.musics = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                })
                .finally(function () {
                    self.isLoading = false;
                });
        },
        returnTags: function () {
            let self = this;
            api.get("/musicas/tags")
                .then(function (response) {
                    self.allTags = response.data.returnObj;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        toggleAdvancedFilters: function () {
            this.showAdvancedFilters = !this.showAdvancedFilters;
        },
        toggleTagSelection: function (tag) {
            const index = this.selectedTags.findIndex(t => t.id === tag.id);
            if (index > -1) {
                this.selectedTags.splice(index, 1);
            } else {
                this.selectedTags.push(tag);
            }
        },
        isTagSelected: function (tag) {
            return this.selectedTags.some(t => t.id === tag.id);
        },
        clearSelectedTags: function () {
            this.selectedTags = [];
        }
    },
    mounted: function () {
        this.returnMusics();
        this.returnTags();
    },
    watch: {
        igreja: {
            handler: function (church) {
                if (church && church.id_igreja) {
                    this.returnMusics();
                }
            },
            deep: true
        }
    },
    components: {
        musicComponent,
        createMusicModalContent,
        modal,
        skeletonLoader
    }
}
</script>
<style scoped>
.music-filters-wrapper {
  margin: 1rem 0 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.search-bar-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.search-input-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.search-input {
  width: 100%;
  height: 46px;
  background: rgba(24, 21, 56, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 0 40px;
  color: var(--neutral-white);
  font-size: var(--font-size-4);
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--primary-primary-blue-high-2);
  background: rgba(24, 21, 56, 0.8);
  box-shadow: var(--glow-shadow);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--neutral-gray-medium);
  font-size: 20px;
  pointer-events: none;
}

.clear-icon {
  position: absolute;
  right: 12px;
  color: var(--neutral-gray-medium);
  font-size: 18px;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.clear-icon:hover {
  color: var(--neutral-white);
}

.btn-advanced-filter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: rgba(24, 21, 56, 0.45);
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: var(--neutral-gray-high);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-advanced-filter:hover,
.btn-advanced-filter.active {
  background: rgba(24, 21, 56, 0.85);
  border-color: var(--primary-primary-blue-high-2);
  color: var(--neutral-white);
}

.badge-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: var(--secondary-blue-soft);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--secondary-blue-soft);
}

.advanced-filters-panel {
  background: rgba(24, 21, 56, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  padding: 14px;
  backdrop-filter: var(--glass-blur);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.panel-header h6 {
  margin: 0;
  color: var(--neutral-gray-high);
  font-size: var(--font-size-5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
}

.btn-clear-tags {
  background: transparent;
  border: none;
  color: var(--secondary-blue-soft);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity var(--transition-fast);
}

.btn-clear-tags:hover {
  text-decoration: underline;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--neutral-gray-medium);
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: var(--font-size-5);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: capitalize;
}

.filter-tag-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--neutral-white);
  border-color: rgba(255, 255, 255, 0.15);
}

.filter-tag-chip.selected {
  background: var(--secondary-blue-soft-2);
  border-color: rgba(56, 182, 255, 0.4);
  color: var(--secondary-blue-soft);
}

.chip-check {
  font-size: 14px;
}

.musics-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  color: var(--neutral-gray-medium);
  background: rgba(24, 21, 56, 0.15);
  border: 1px dashed rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  margin-top: 1rem;
}

.musics-empty-state .empty-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.1);
  margin-bottom: 0.75rem;
}

.musics-empty-state h5 {
  margin: 0 0 0.5rem;
  color: var(--neutral-white);
  font-size: var(--font-size-3);
  font-weight: 600;
}

.musics-empty-state p {
  margin: 0;
  font-size: var(--font-size-4);
  line-height: 1.4;
  max-width: 320px;
}

/* Transição de expansão */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease-out;
  max-height: 200px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>
