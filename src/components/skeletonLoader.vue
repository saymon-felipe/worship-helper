<template>
    <div class="skeleton-wrapper">
        <!-- Church Card Skeleton -->
        <template v-if="type === 'church-card'">
            <div v-for="i in itemList" :key="i" class="church-card skeleton-box skeleton-card-item">
                <div class="church-link">
                    <div class="church-avatar skeleton-circle"></div>
                    <div class="church-details">
                        <div class="skeleton-text" style="width: 55%; height: 18px; margin-bottom: 8px;"></div>
                        <div class="skeleton-text" style="width: 35%; height: 13px;"></div>
                    </div>
                    <div class="login-action skeleton-circle"></div>
                </div>
            </div>
        </template>

        <!-- Event Card Skeleton -->
        <template v-else-if="type === 'event-card'">
            <div v-for="i in itemList" :key="i" class="event-card-skeleton skeleton-box">
                <div class="event-date-box skeleton-circle"></div>
                <div class="event-details-box">
                    <div class="skeleton-text" style="width: 60%; height: 18px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 40%; height: 13px;"></div>
                </div>
                <div class="skeleton-text" style="width: 24px; height: 24px; border-radius: 50%;"></div>
            </div>
        </template>

        <!-- Music Card Skeleton -->
        <template v-else-if="type === 'music-card'">
            <div v-for="i in itemList" :key="i" class="music-card-skeleton skeleton-box">
                <div class="music-thumb skeleton-circle"></div>
                <div class="music-details-box">
                    <div class="skeleton-text" style="width: 65%; height: 16px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 45%; height: 12px;"></div>
                </div>
                <div class="tone-badge-skeleton skeleton-box" style="width: 38px; height: 24px; border-radius: 6px;"></div>
            </div>
        </template>

        <!-- Member Card Skeleton -->
        <template v-else-if="type === 'member-card'">
            <div v-for="i in itemList" :key="i" class="member-card-skeleton skeleton-box">
                <div class="member-avatar-skeleton skeleton-circle"></div>
                <div class="member-details-skeleton">
                    <div class="skeleton-text" style="width: 50%; height: 16px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 35%; height: 12px;"></div>
                </div>
                <div class="skeleton-text" style="width: 28px; height: 28px; border-radius: 50%;"></div>
            </div>
        </template>

        <!-- Warning / Announcement Banner Skeleton -->
        <template v-else-if="type === 'banner'">
            <div class="banner-skeleton skeleton-box">
                <div class="banner-icon-skeleton skeleton-box"></div>
                <div class="banner-content-skeleton">
                    <div class="skeleton-text" style="width: 30%; height: 11px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 75%; height: 18px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 45%; height: 12px;"></div>
                </div>
            </div>
        </template>

        <!-- Event Hero Skeleton -->
        <template v-else-if="type === 'hero-event'">
            <div class="event-hero-skeleton skeleton-box">
                <div class="hero-top-skeleton">
                    <div class="skeleton-text" style="width: 55%; height: 26px;"></div>
                    <div class="skeleton-text" style="width: 120px; height: 36px; border-radius: 8px;"></div>
                </div>
                <div class="hero-details-skeleton">
                    <div class="detail-item-skeleton">
                        <div class="skeleton-circle" style="width: 36px; height: 36px;"></div>
                        <div style="flex: 1;">
                            <div class="skeleton-text" style="width: 40%; height: 11px; margin-bottom: 4px;"></div>
                            <div class="skeleton-text" style="width: 70%; height: 14px;"></div>
                        </div>
                    </div>
                    <div class="detail-item-skeleton">
                        <div class="skeleton-circle" style="width: 36px; height: 36px;"></div>
                        <div style="flex: 1;">
                            <div class="skeleton-text" style="width: 40%; height: 11px; margin-bottom: 4px;"></div>
                            <div class="skeleton-text" style="width: 60%; height: 14px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Music Hero Skeleton -->
        <template v-else-if="type === 'hero-music'">
            <div class="music-hero-skeleton skeleton-box">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div class="skeleton-circle" style="width: 64px; height: 64px; flex-shrink: 0;"></div>
                    <div style="flex-grow: 1;">
                        <div class="skeleton-text" style="width: 60%; height: 20px; margin-bottom: 8px;"></div>
                        <div class="skeleton-text" style="width: 40%; height: 14px;"></div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Comments / Avisos Skeleton -->
        <template v-else-if="type === 'comments'">
            <div v-for="i in itemList" :key="i" class="comment-skeleton skeleton-box">
                <div class="comment-avatar-skeleton skeleton-circle"></div>
                <div class="comment-body-skeleton">
                    <div class="skeleton-text" style="width: 35%; height: 14px; margin-bottom: 6px;"></div>
                    <div class="skeleton-text" style="width: 90%; height: 14px; margin-bottom: 4px;"></div>
                    <div class="skeleton-text" style="width: 60%; height: 14px;"></div>
                </div>
            </div>
        </template>

        <!-- Profile Skeleton -->
        <template v-else-if="type === 'profile'">
            <div class="profile-skeleton skeleton-box">
                <div class="skeleton-circle" style="width: 96px; height: 96px; margin: 0 auto 16px;"></div>
                <div class="skeleton-text" style="width: 40%; height: 22px; margin: 0 auto 8px; display: block;"></div>
                <div class="skeleton-text" style="width: 55%; height: 14px; margin: 0 auto 20px; display: block;"></div>
                <div class="skeleton-text" style="width: 140px; height: 42px; margin: 0 auto; border-radius: 20px; display: block;"></div>
            </div>
        </template>

        <!-- Config Chips Skeleton -->
        <template v-else-if="type === 'config-chips'">
            <div class="chips-skeleton-container skeleton-box">
                <div class="skeleton-text" style="width: 30%; height: 18px; margin-bottom: 16px;"></div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <div v-for="n in 6" :key="n" class="skeleton-text" style="width: 80px; height: 32px; border-radius: 16px;"></div>
                </div>
            </div>
        </template>

        <!-- Config Functions Skeleton -->
        <template v-else-if="type === 'config-functions'">
            <div v-for="i in itemList" :key="i" class="function-card-skeleton skeleton-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div class="skeleton-text" style="width: 45%; height: 18px;"></div>
                    <div class="skeleton-text" style="width: 50px; height: 24px; border-radius: 12px;"></div>
                </div>
                <div class="skeleton-text" style="width: 70%; height: 13px; margin-bottom: 12px;"></div>
                <div style="display: flex; gap: 6px;">
                    <div class="skeleton-text" style="width: 70px; height: 24px; border-radius: 12px;"></div>
                    <div class="skeleton-text" style="width: 90px; height: 24px; border-radius: 12px;"></div>
                </div>
            </div>
        </template>

        <!-- Cipher Lines Skeleton -->
        <template v-else-if="type === 'cipher'">
            <div class="cipher-skeleton skeleton-box">
                <div class="skeleton-text" style="width: 30%; height: 22px; margin-bottom: 20px;"></div>
                <div v-for="n in 8" :key="n" style="margin-bottom: 14px;">
                    <div class="skeleton-text" style="width: 25%; height: 14px; margin-bottom: 4px; background: rgba(56, 182, 255, 0.2) !important;"></div>
                    <div class="skeleton-text" style="width: 80%; height: 14px;"></div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: "skeletonLoader",
    props: {
        type: {
            type: String,
            default: "church-card"
        },
        count: {
            type: Number,
            default: 1
        }
    },
    computed: {
        itemList() {
            return Array.from({ length: this.count }, (_, i) => i + 1);
        }
    }
}
</script>

<style scoped>
.skeleton-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.skeleton-card-item {
    padding: 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    backdrop-filter: var(--glass-blur);
}

.event-card-skeleton {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.event-date-box {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md) !important;
    flex-shrink: 0;
}

.event-details-box, .music-details-box, .member-details-skeleton, .comment-body-skeleton, .banner-content-skeleton {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.music-card-skeleton {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.music-thumb {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md) !important;
    flex-shrink: 0;
}

.member-card-skeleton {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.member-avatar-skeleton {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
}

.banner-skeleton {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.banner-icon-skeleton {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    flex-shrink: 0;
}

.event-hero-skeleton, .music-hero-skeleton, .profile-skeleton, .chips-skeleton-container, .function-card-skeleton, .cipher-skeleton {
    padding: 20px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.hero-top-skeleton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.hero-details-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
}

.detail-item-skeleton {
    display: flex;
    align-items: center;
    gap: 10px;
}

.comment-skeleton {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-radius: var(--radius-md);
    border: 1px solid var(--card-border);
    background: var(--card-bg);
}

.comment-avatar-skeleton {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}
</style>
