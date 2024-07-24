<template>
    <div class="music-component" v-on:click="clickInMusic($event)">
        <div class="music-inner">
            <img :src="music.image" class="avatar-p">
            <div class="music-informations">
                <span class="font-size-3">{{ music.name }}</span>
                <span class="font-size-4">{{ music.artist }}</span>
                <div class="music-tags">
                    <div class="music-tag" v-for="(tag, index) in music.tags" :key="index">{{ tag.nome }}</div>
                </div>
            </div>
        </div>
        <div class="remove-music" v-on:click="removeMusic()" v-if="allowremove == 'true'">
            <span class="material-icons">close</span>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';

export default {
    name: "musicComponent",
    props: ["music", "library", "clicktype", "allowremove"],
    methods: {
        removeMusic: function () {
            this.$emit("remove", this.music);
        },
        clickInMusic: function (event) {
            let element = $(event.currentTarget);

            switch (this.clicktype) {
                case "select":
                    $(".music-component").removeClass("selected");
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
.music-component {
    margin: 1rem 0;
}

.music-component, .music-tags, .music-inner {
    display: flex;
    align-items: center;
}

.music-component {
    justify-content: space-between;
}

.remove-music {
    margin-right: .8rem;
    display: flex;
    align-items: center;
}

.music-informations {
    display: flex;
    flex-direction: column;
}

.music-tags .music-tag:first-child {
    margin-left: 0 !important;
}
</style>