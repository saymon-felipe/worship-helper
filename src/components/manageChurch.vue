<template>
    <div class="manage-church">
        <div class="manage-container">
            <!-- Church Profile Header Banner -->
            <skeletonLoader v-if="!igreja.id_igreja" type="church-card" style="margin-bottom: 20px;" />
            <div class="church-profile-card" v-else-if="igreja.id_igreja && igreja.id_igreja == getCurrentChurchId()">
                <div class="avatar-wrapper">
                    <img :src="igreja.imagem_igreja || default_church_image" class="church-avatar-img">
                </div>
                <div class="church-info-details">
                    <span class="church-label">Administração</span>
                    <h5 class="church-name">{{ igreja.nome_igreja }}</h5>
                    <div class="church-stats" v-if="igreja.quantidade_membros !== undefined && igreja.quantidade_membros !== null">
                        <div class="members-pill">
                            <span class="material-icons">people</span>
                            <span>{{ returnMembersText(igreja.quantidade_membros) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions Grid -->
            <div class="actions-grid">
                <!-- Music Library -->
                <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/musics'" class="church-action-card">
                    <div class="card-icon-box icon-musics">
                        <span class="material-icons">playlist_play</span>
                    </div>
                    <div class="card-info-content">
                        <h6 class="card-title">Acervo de músicas</h6>
                        <p class="card-description">Cifras, letras, tons e repertórios do ministério.</p>
                    </div>
                    <div class="card-arrow-action">
                        <span class="material-icons">chevron_right</span>
                    </div>
                </router-link>

                <!-- Members -->
                <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/members'" class="church-action-card">
                    <div class="card-icon-box icon-members">
                        <span class="material-icons">group</span>
                    </div>
                    <div class="card-info-content">
                        <h6 class="card-title">{{ canManageMembers ? "Gerenciar" : "Ver" }} membros</h6>
                        <p class="card-description">Gerenciamento de integrantes, funções e permissões.</p>
                    </div>
                    <div class="card-arrow-action">
                        <span class="material-icons">chevron_right</span>
                    </div>
                </router-link>

                <!-- Calendar / Services -->
                <router-link :to="'/home/manage-church/' + igreja.id_igreja + '/events'" class="church-action-card">
                    <div class="card-icon-box icon-events">
                        <span class="material-icons">event</span>
                    </div>
                    <div class="card-info-content">
                        <h6 class="card-title">Calendário de cultos</h6>
                        <p class="card-description">Ensaios, escalas de cultos e eventos agendados.</p>
                    </div>
                    <div class="card-arrow-action">
                        <span class="material-icons">chevron_right</span>
                    </div>
                </router-link>

                <!-- Settings (Conditional) -->
                <router-link v-if="canConfigureChurch" :to="'/home/manage-church/' + igreja.id_igreja + '/config'" class="church-action-card">
                    <div class="card-icon-box icon-config">
                        <span class="material-icons">settings</span>
                    </div>
                    <div class="card-info-content">
                        <h6 class="card-title">Configurações da igreja</h6>
                        <p class="card-description">Ajuste de funções, permissões gerais e tags de membros.</p>
                    </div>
                    <div class="card-arrow-action">
                        <span class="material-icons">chevron_right</span>
                    </div>
                </router-link>
            </div>

            <!-- Warnings/Announcements Card -->
            <div class="warnings-card-wrapper">
                <div class="warnings-header-box">
                    <div class="warnings-icon-badge">
                        <span class="material-icons">campaign</span>
                    </div>
                    <h5 class="warnings-title">Avisos e Comunicados</h5>
                </div>
                <commentsComponent type="aviso" :can-create-thread="canCreateWarnings" :can-manage-thread="canManageWarnings"></commentsComponent>
            </div>
        </div>
    </div>
</template>
<script>
import { globalMethods } from '../js/globalMethods';
import commentsComponent from "./commentsComponent.vue";
import skeletonLoader from "./skeletonLoader.vue";
import api from '../config/api';
import { appStore } from '../store/appStore';

export default {
    name: "manageChurch",
    mixins: [globalMethods],
    components: {
        commentsComponent,
        skeletonLoader
    },
    data() {
        return {
            canManageChurch: false,
            canManageMembers: false,
            canConfigureChurch: false,
            canCreateWarnings: false,
            canManageWarnings: false
        }
    },
    methods: {
        updateActionPermissions: function () {
            this.canManageChurch = this.haveAdminPermission || this.haveAppPermission;
            this.canManageMembers = this.canManageChurch || this.hasChurchPermission("members.manage") || this.hasChurchPermission("members.invite") || this.hasChurchPermission("members.remove") || this.hasChurchPermission("members.roles") || this.hasChurchPermission("members.tags");
            this.canConfigureChurch = this.canManageChurch || this.hasChurchPermission("members.roles") || this.hasChurchPermission("members.tags");
            this.canCreateWarnings = this.canManageChurch || this.hasChurchPermission("warnings.create");
            this.canManageWarnings = this.canManageChurch || this.hasChurchPermission("warnings.edit") || this.hasChurchPermission("warnings.delete");
        },
        loadChurchPermission: function () {
            const churchId = this.getCurrentChurchId();
            const currentChurch = this.getCurrentChurchInLocalStorage();
            const cachedAdmin = currentChurch ? currentChurch.administrador : null;
            const hasCachedPermission = typeof cachedAdmin === "boolean" || cachedAdmin === 0 || cachedAdmin === 1 || cachedAdmin === "0" || cachedAdmin === "1";

            if (currentChurch && currentChurch.id_igreja == churchId && hasCachedPermission && (cachedAdmin === true || cachedAdmin === 1 || cachedAdmin === "1")) {
                this.canManageChurch = cachedAdmin === true || cachedAdmin === 1 || cachedAdmin === "1";
                appStore.setChurchPermission({
                    administrador: this.canManageChurch,
                    apenas_membro: !this.canManageChurch,
                    permissions: []
                });
                this.updateActionPermissions();
                return;
            }

            if (!churchId) {
                return;
            }

            if (appStore.state.church && appStore.state.church.id_igreja == churchId) {
                this.canManageChurch = appStore.state.churchPermission.administrador;
                this.updateActionPermissions();
                return;
            }

            api.post("/igreja/permissao", { id_igreja: churchId })
                .then((response) => {
                    appStore.setChurchPermission(response.data.returnObj);
                    this.canManageChurch = response.data.returnObj.administrador == 1 || response.data.returnObj.administrador === true;
                    this.updateActionPermissions();
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    mounted: function () {
        this.loadChurchPermission();
    }
}
</script>
<style scoped>
.manage-church {
    padding-bottom: 2rem;
    animation: fadeIn var(--transition-normal);
}

.manage-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Profile Card Styling */
.church-profile-card {
    background: linear-gradient(135deg, rgba(24, 21, 56, 0.45), rgba(63, 57, 161, 0.12));
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    overflow: hidden;
}

.church-profile-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(56, 182, 255, 0.08) 0%, transparent 70%);
    pointer-events: none;
}

.avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.church-avatar-img {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 3px solid var(--secondary-blue-soft);
    box-shadow: 0 0 20px rgba(56, 182, 255, 0.25);
    transition: transform var(--transition-fast);
}

.church-avatar-img:hover {
    transform: scale(1.05);
}

.church-info-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.church-label {
    font-size: var(--font-size-6);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--secondary-blue-soft);
    font-weight: 700;
}

.church-name {
    margin: 0;
    font-size: var(--font-size-2);
    font-weight: 800;
    color: var(--neutral-white);
    letter-spacing: -0.5px;
}

.church-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 2px;
}

.members-pill {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
    font-weight: 500;
}

.members-pill .material-icons {
    font-size: 14px;
    color: var(--secondary-blue-soft);
}

/* Actions Grid Layout */
.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
}

/* Premium Dashboard Card */
.church-action-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    text-decoration: none;
    color: var(--neutral-white) !important;
    transition: all var(--transition-fast);
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    position: relative;
    overflow: hidden;
}

.church-action-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
}

.church-action-card:hover::after {
    transform: translateX(100%);
}

.church-action-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.45);
    background: rgba(24, 21, 56, 0.85);
}

/* Card Icon Box */
.card-icon-box {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform var(--transition-fast);
}

.church-action-card:hover .card-icon-box {
    transform: scale(1.1);
}

/* Themed Icon Boxes */
.icon-musics {
    background: rgba(56, 182, 255, 0.1);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
}

.icon-members {
    background: rgba(148, 196, 137, 0.1);
    border: 1px solid rgba(148, 196, 137, 0.2);
    color: var(--tertiary-tertiary-green-high);
}

.icon-events {
    background: rgba(255, 200, 44, 0.1);
    border: 1px solid rgba(255, 200, 44, 0.2);
    color: var(--others-yellow);
}

.icon-config {
    background: rgba(63, 57, 161, 0.15);
    border: 1px solid rgba(63, 57, 161, 0.3);
    color: var(--primary-primary-blue-high-2);
}

.card-icon-box .material-icons {
    font-size: 26px;
}

/* Card Texts */
.card-info-content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.card-title {
    font-size: var(--font-size-4);
    font-weight: 700;
    color: var(--neutral-white);
    margin: 0;
}

.card-description {
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
    margin: 0;
    line-height: 1.4;
}

/* Card Arrow */
.card-arrow-action {
    color: var(--neutral-gray-low);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--transition-fast), color var(--transition-fast);
}

.church-action-card:hover .card-arrow-action {
    transform: translateX(4px);
    color: var(--secondary-blue-soft);
}

.card-arrow-action .material-icons {
    font-size: 20px;
}

/* Warnings Card Styling */
.warnings-card-wrapper {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.warnings-header-box {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 12px;
}

.warnings-icon-badge {
    background: rgba(255, 200, 44, 0.1);
    border: 1px solid rgba(255, 200, 44, 0.2);
    color: var(--others-yellow);
    width: 36px;
    height: 36px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
}

.warnings-icon-badge .material-icons {
    font-size: 20px;
}

.warnings-title {
    font-size: var(--font-size-4);
    font-weight: 800;
    margin: 0;
    color: var(--neutral-white);
}

/* Mobile optimizations */
@media (max-width: 576px) {
    .church-profile-card {
        padding: 16px;
        gap: 14px;
    }
    
    .church-avatar-img {
        width: 64px;
        height: 64px;
    }
    
    .church-name {
        font-size: var(--font-size-3);
    }
    
    .church-action-card {
        padding: 16px;
        gap: 12px;
    }
    
    .card-icon-box {
        width: 42px;
        height: 42px;
    }
    
    .card-icon-box .material-icons {
        font-size: 22px;
    }
    
    .card-title {
        font-size: var(--font-size-h5);
    }
    
    .card-description {
        font-size: 11px;
    }
    
    .warnings-card-wrapper {
        padding: 16px;
    }
}
</style>
