<template>
    <router-link :to="library != 'true' ? '/home/musics/' + music.id : ''" v-on:click="addMusic()">
        <div class="music-component">
            <img :src="music.image" class="avatar-p">
            <div class="music-informations">
                <span class="font-size-3">{{ music.name }}</span>
                <span class="font-size-4">{{ music.artist }}</span>
                <div class="music-tags">
                    <div class="music-tag" v-for="(tag, index) in music.tags" :key="index">{{ tag.name }}</div>
                </div>
            </div>
        </div>
    </router-link>
</template>
<script>
export default {
    name: "musicComponent",
    props: ["music", "library"],
    methods: {
        addMusic: function () {
            if (this.library == "true") {
                this.$emit("selectMusic", this.music.id);
            }
        }
    }
}
</script>
<style scoped>
.music-component {
    margin: 1rem 0;
}

.music-component, .music-tags {
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