<template>
    <div class="music-card" v-on:click="clickInMusic($event)" :class="{ 'clickable-card': clicktype !== 'none' }">
        <div class="music-card-left">
            <img :src="music.image || default_music_image" class="music-art-avatar" alt="Imagem da música">
            <div class="music-meta">
                <span class="music-name font-size-3">{{ music.name }}</span>
                <span class="music-artist font-size-4">{{ music.artist }}</span>
                <div class="music-tags-wrapper" v-if="music.tags && music.tags.length > 0">
                    <span class="music-tag-chip" v-for="(tag, index) in music.tags" :key="index">{{ tag.nome }}</span>
                </div>
            </div>
        </div>
        <div class="music-card-right">
            <button class="remove-music-btn" v-on:click.stop="removeMusic()" v-if="allowremove == 'true'" title="Remover música">
                <span class="material-icons">close</span>
            </button>
        </div>
    </div>
</template>
<script>
import api from '../config/api';
import $ from 'jquery';

export default {
    name: "musicComponent",
    props: ["music", "library", "clicktype", "allowremove"],
    data() {
        return {
            default_music_image: api.defaults.baseURL + "/public/music-default-image.png"
        }
    },
    methods: {
        removeMusic: function () {
            this.$emit("remove", this.music);
        },
        clickInMusic: function (event) {
            let element = $(event.currentTarget);

            switch (this.clicktype) {
                case "select":
                    $(".music-card").removeClass("selected");
                    element.addClass("selected");
                    this.$emit("select", this.music);
                    break;
                case "none":
                    break;
                case undefined:
                    if (this.library != "true") {
                        this.$router.push('/home/musics/' + this.music.id);
                    }
                    break;
            }
        }
    }
}
</script>
<style scoped>
.music-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    margin: 12px 0;
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.clickable-card {
    cursor: pointer;
}

.clickable-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.music-card-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0; /* Permite truncamento de texto flex */
}

.music-art-avatar {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
}

.music-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0; /* Impede transbordamento de texto */
}

.music-name {
    font-weight: 600;
    color: var(--neutral-white);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-artist {
    color: var(--neutral-gray-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.music-tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
}

.music-tag-chip {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--neutral-gray-high);
    border-radius: var(--radius-pill);
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
}

.music-card-right {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
}

.remove-music-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--neutral-gray-low);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-pill);
    transition: background var(--transition-fast), color var(--transition-fast);
}

.remove-music-btn:hover {
    background: rgba(241, 76, 76, 0.15);
    color: var(--others-red);
}

.remove-music-btn span {
    font-size: 20px;
}

@media (max-width: 480px) {
    .music-art-avatar {
        width: 44px;
        height: 44px;
    }
    
    .music-name {
        font-size: var(--font-size-4);
    }
    
    .music-artist {
        font-size: var(--font-size-5);
    }
    
    .music-tag-chip {
        font-size: 10px;
        padding: 1px 6px;
    }
}
</style>
