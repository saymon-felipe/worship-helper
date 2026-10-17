<template>
    <div class="member-profile">
        <article class="social-profile-card">
            <!-- Capa / Banner com fundo ambient e badges -->
            <div class="profile-banner">
                <img
                    v-if="member && member.imagem_usuario"
                    :src="member.imagem_usuario"
                    alt=""
                    aria-hidden="true"
                    class="banner-backdrop-img"
                >
                <div class="banner-overlay"></div>
                <div class="banner-orb banner-orb-1"></div>
                <div class="banner-orb banner-orb-2"></div>

                <div class="banner-top-badges">
                    <span class="church-pill" v-if="churchName" :title="'Membro da igreja ' + churchName">
                        <span class="material-icons">church</span>
                        <span>{{ churchName }}</span>
                    </span>
                    <span class="owner-pill" v-if="isOwner" title="Administrador da Igreja">
                        <span class="material-icons">verified</span>
                        <span>Admin</span>
                    </span>
                </div>
            </div>

            <div class="profile-body">
                <!-- Cabeçalho do Perfil: Avatar + Identidade -->
                <div class="profile-header-row">
                    <div class="profile-avatar-wrapper">
                        <div class="profile-avatar">
                            <img :src="(member && member.imagem_usuario) || defaultAvatar" :alt="(member && member.nome_usuario) || 'Membro'">
                        </div>
                    </div>

                    <div class="profile-identity">
                        <h3 class="profile-name">{{ (member && member.nome_usuario) || 'Membro' }}</h3>

                        <!-- Funções / Instrumentos -->
                        <div class="profile-roles-group" v-if="functions.length > 0">
                            <span
                                class="role-chip"
                                v-for="(func, index) in functions"
                                :key="func.id_funcao || index"
                            >
                                <span class="material-icons role-icon">{{ getRoleIcon(func.nome_funcao) }}</span>
                                <span>{{ func.nome_funcao }}</span>
                            </span>
                        </div>
                        <p class="profile-empty-role" v-else>Sem função atribuída</p>

                        <!-- Tags / Ministérios -->
                        <div class="profile-tags-group" v-if="tags.length > 0">
                            <span
                                class="tag-chip"
                                v-for="(tag, index) in tags"
                                :key="tag.id_tag || index"
                            >
                                <span class="material-icons tag-icon">local_offer</span>
                                <span>{{ tag.nome_tag }}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Seção Sobre / Biografia -->
                <section class="profile-section-card">
                    <div class="section-card-header">
                        <span class="material-icons section-icon">format_quote</span>
                        <h5>Sobre</h5>
                    </div>
                    <div class="section-card-content">
                        <p class="profile-bio" v-if="bio">{{ bio }}</p>
                        <p class="profile-bio is-placeholder" v-else>Nenhuma biografia adicionada...</p>
                    </div>
                </section>

                <!-- Seção Contato -->
                <section class="profile-section-card">
                    <div class="section-card-header">
                        <span class="material-icons section-icon">alternate_email</span>
                        <h5>Contato</h5>
                    </div>
                    <div class="section-card-content">
                        <a
                            v-if="member && member.email_usuario"
                            :href="'mailto:' + member.email_usuario"
                            class="contact-email-link"
                            title="Enviar e-mail para este membro"
                        >
                            {{ member.email_usuario }}
                        </a>
                        <p class="contact-email-link is-placeholder" v-else>
                            Nenhum e-mail informado...
                        </p>
                    </div>
                </section>

                <!-- Ações Rápidas de Gestão (para Administradores/Líderes) -->
                <section class="quick-management-section" v-if="canManageTags || canManageRoles">
                    <div class="management-header">
                        <span class="material-icons management-icon">tune</span>
                        <span>Ações Rápidas</span>
                    </div>
                    <div class="management-buttons-grid">
                        <button
                            type="button"
                            class="management-btn"
                            v-if="canManageRoles"
                            @click="$emit('manageRoles')"
                            title="Atribuir ou alterar funções do membro"
                        >
                            <span class="material-icons">work_outline</span>
                            <span>Alterar Funções</span>
                        </button>
                        <button
                            type="button"
                            class="management-btn"
                            v-if="canManageTags"
                            @click="$emit('manageTags')"
                            title="Atribuir ou alterar tags do membro"
                        >
                            <span class="material-icons">local_offer</span>
                            <span>Gerenciar Tags</span>
                        </button>
                    </div>
                </section>
            </div>
        </article>
    </div>
</template>

<script>
export default {
    name: "memberProfileModalContent",
    props: ["member", "defaultAvatar", "church", "canManageTags", "canManageRoles"],
    emits: ["manageTags", "manageRoles"],
    computed: {
        functions: function () {
            return this.member && Array.isArray(this.member.funcoes_usuario) ? this.member.funcoes_usuario : [];
        },
        tags: function () {
            return this.member && Array.isArray(this.member.tag_usuario) ? this.member.tag_usuario : [];
        },
        bio: function () {
            return String((this.member && this.member.descricao_usuario) || "").trim();
        },
        churchName: function () {
            return this.church && this.church.nome_igreja ? String(this.church.nome_igreja).trim() : "";
        },
        isOwner: function () {
            return Boolean(this.member && (this.member.app_owner == 1 || this.member.app_owner === true));
        }
    },
    methods: {
        getRoleIcon: function (roleName) {
            if (!roleName) return "music_note";
            const name = String(roleName).toLowerCase();
            if (name.includes("bat") || name.includes("percu")) return "album";
            if (name.includes("voc") || name.includes("cant") || name.includes("voz") || name.includes("minist")) return "mic";
            if (name.includes("guit") || name.includes("viol") || name.includes("baix") || name.includes("cord")) return "music_note";
            if (name.includes("tecl") || name.includes("pian") || name.includes("sint")) return "piano";
            if (name.includes("som") || name.includes("audio") || name.includes("áudio") || name.includes("mesa")) return "volume_up";
            if (name.includes("luz") || name.includes("ilum")) return "lightbulb";
            if (name.includes("proj") || name.includes("transm") || name.includes("multimidia") || name.includes("mídia") || name.includes("midia")) return "videocam";
            if (name.includes("lid") || name.includes("líder") || name.includes("past") || name.includes("coord")) return "stars";
            return "music_note";
        }
    }
}
</script>

<style scoped>
.member-profile {
    display: flex;
    flex-direction: column;
    max-width: 620px;
    width: 100%;
    margin: 0 auto;
    padding: 2px 0 10px;
}

.social-profile-card {
    background: var(--card-bg, rgba(24, 21, 56, 0.75));
    border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 20px);
    overflow: hidden;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    position: relative;
}

/* Banner de Capa */
.profile-banner {
    position: relative;
    height: 130px;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #181442 0%, #292468 45%, #183b77 80%, #205599 100%);
}

.banner-backdrop-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(24px) saturate(1.8) brightness(0.75);
    transform: scale(1.3);
    opacity: 0.6;
    pointer-events: none;
}

.banner-overlay {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 85% 25%, rgba(56, 182, 255, 0.32), transparent 55%),
        linear-gradient(180deg, rgba(11, 10, 26, 0.08) 0%, rgba(18, 16, 42, 0.95) 100%);
}

.banner-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(32px);
    pointer-events: none;
}

.banner-orb-1 {
    width: 150px;
    height: 150px;
    top: -40px;
    right: 8%;
    background: rgba(56, 182, 255, 0.28);
}

.banner-orb-2 {
    width: 130px;
    height: 130px;
    bottom: -40px;
    left: 20%;
    background: rgba(63, 57, 161, 0.5);
}

.banner-top-badges {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    flex-wrap: wrap;
}

.church-pill,
.owner-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: var(--radius-pill, 9999px);
    font-size: 11.5px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    line-height: 1;
}

.church-pill {
    background: rgba(11, 10, 26, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.14);
    color: var(--neutral-gray-high, #dee2e6);
}

.church-pill .material-icons {
    font-size: 14px;
    color: var(--secondary-blue-soft, #38b6ff);
}

.owner-pill {
    background: linear-gradient(135deg, rgba(56, 182, 255, 0.22) 0%, rgba(63, 57, 161, 0.35) 100%);
    border: 1px solid rgba(56, 182, 255, 0.45);
    color: #ffffff;
    box-shadow: 0 2px 10px rgba(56, 182, 255, 0.2);
}

.owner-pill .material-icons {
    font-size: 14px;
    color: var(--secondary-blue-soft, #38b6ff);
}

/* Corpo Principal */
.profile-body {
    padding: 0 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Foto + Identidade */
.profile-header-row {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    margin-top: -46px;
    position: relative;
    z-index: 3;
}

.profile-avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.profile-avatar {
    width: 104px;
    height: 104px;
    border-radius: var(--radius-pill, 9999px);
    overflow: hidden;
    border: 4px solid #13112c;
    box-shadow:
        0 0 0 2px rgba(56, 182, 255, 0.65),
        0 12px 26px rgba(0, 0, 0, 0.6);
    background-color: var(--primary-primary-blue-high, #2d2872);
}

.profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.profile-identity {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
    flex: 1;
    padding-top: 36px;
}

.profile-name {
    margin: 0;
    font-size: clamp(21px, 3.2vw, 25px);
    font-weight: 700;
    color: #ffffff;
    line-height: 1.25;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
}

/* Funções / Instrumentos */
.profile-roles-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
}

.role-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(56, 182, 255, 0.16) 0%, rgba(63, 57, 161, 0.28) 100%);
    border: 1px solid rgba(56, 182, 255, 0.38);
    color: #ffffff;
    border-radius: var(--radius-pill, 9999px);
    padding: 4px 11px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.role-chip .role-icon {
    font-size: 14px;
    color: var(--secondary-blue-soft, #38b6ff);
}

.profile-empty-role {
    margin: 2px 0 0;
    font-size: var(--font-size-5, 12px);
    color: var(--neutral-gray-low, #6c757d);
}

/* Tags / Ministérios */
.profile-tags-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
}

.tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.11);
    color: var(--neutral-gray-high, #dee2e6);
    border-radius: var(--radius-pill, 9999px);
    padding: 3px 10px;
    font-size: 11.5px;
    font-weight: 500;
    line-height: 1.2;
}

.tag-chip .tag-icon {
    font-size: 12px;
    color: var(--neutral-gray-medium, #adb5bd);
}

/* Cards de Seção (Sobre & Contato) */
.profile-section-card {
    background: rgba(11, 10, 26, 0.46);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md, 12px);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.section-card-header {
    display: flex;
    align-items: center;
    gap: 7px;
}

.section-icon {
    font-size: 18px;
    width: 18px;
    color: var(--secondary-blue-soft, #38b6ff);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.section-card-header h5 {
    margin: 0;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--neutral-white, #ffffff);
    letter-spacing: 0.02em;
}

/* Conteúdo indentado alinhando com o texto do cabeçalho (18px icon + 7px gap = 25px) */
.section-card-content {
    padding-left: 25px;
    display: flex;
    flex-direction: column;
}

.profile-bio {
    margin: 0;
    font-size: var(--font-size-4, 14px);
    color: #b8b5d6;
    font-style: italic;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.profile-bio.is-placeholder {
    color: var(--neutral-gray-low, #6c757d);
}

.contact-email-link {
    font-size: var(--font-size-4, 14px);
    color: var(--secondary-blue-soft, #38b6ff);
    text-decoration: underline;
    text-underline-offset: 3px;
    font-style: italic;
    line-height: 1.5;
    overflow-wrap: anywhere;
    transition: var(--transition-fast, 0.2s ease);
    display: inline-block;
    width: fit-content;
}

.contact-email-link:hover {
    color: #ffffff;
}

.contact-email-link.is-placeholder {
    color: var(--neutral-gray-low, #6c757d);
    text-decoration: none;
    cursor: default;
}

/* Seção de Ações Rápidas de Gestão */
.quick-management-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
}

.management-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--neutral-gray-medium, #adb5bd);
}

.management-icon {
    font-size: 15px;
    color: var(--secondary-blue-soft, #38b6ff);
}

.management-buttons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 10px;
}

.management-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: var(--radius-md, 12px);
    font-size: 12.5px;
    font-weight: 600;
    background: rgba(24, 21, 56, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--neutral-white, #ffffff);
    cursor: pointer;
    transition: var(--transition-fast, 0.2s ease);
}

.management-btn .material-icons {
    font-size: 16px;
    color: var(--secondary-blue-soft, #38b6ff);
}

.management-btn:hover {
    background: var(--primary-primary-blue-high, #2d2872);
    border-color: var(--secondary-blue-soft, #38b6ff);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

/* Responsividade Mobile */
@media (max-width: 600px) {
    .profile-banner {
        height: 110px;
    }

    .profile-body {
        padding: 0 16px 18px;
        gap: 14px;
    }

    .profile-header-row {
        gap: 14px;
        margin-top: -38px;
    }

    .profile-avatar {
        width: 88px;
        height: 88px;
    }

    .profile-identity {
        padding-top: 26px;
    }
}
</style>
