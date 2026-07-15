<template>
    <div 
        class="custom-range-container" 
        ref="sliderContainer"
        @pointerdown="handlePointerDown"
    >
        <div class="custom-range-track">
            <div 
                class="custom-range-fill" 
                :style="{ width: progressOffset }"
            ></div>
            <div 
                class="custom-range-thumb" 
                :style="{ left: progressOffset }"
            ></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "customRange",
    props: {
        modelValue: {
            type: Number,
            default: 50
        },
        min: {
            type: Number,
            default: 1
        },
        max: {
            type: Number,
            default: 100
        },
        step: {
            type: Number,
            default: 1
        }
    },
    emits: ["update:modelValue"],
    computed: {
        percentage() {
            const range = this.max - this.min;
            if (range === 0) return 0;
            const val = Math.max(this.min, Math.min(this.max, this.modelValue));
            return ((val - this.min) / range) * 100;
        },
        progressOffset() {
            // Thumb width = 22px
            const pct = this.percentage / 100;
            return `calc(11px + (100% - 22px) * ${pct})`;
        }
    },
    methods: {
        updateValue(clientX) {
            const container = this.$refs.sliderContainer;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
            const ratio = x / rect.width;
            
            let val = this.min + ratio * (this.max - this.min);
            
            if (this.step > 0) {
                val = Math.round(val / this.step) * this.step;
            }
            
            val = Math.max(this.min, Math.min(this.max, val));
            
            this.$emit("update:modelValue", val);
        },
        handlePointerDown(event) {
            const container = this.$refs.sliderContainer;
            if (!container) return;

            // Set pointer capture to capture move events outside the element bounds
            container.setPointerCapture(event.pointerId);
            
            this.updateValue(event.clientX);
            
            const handlePointerMove = (e) => {
                this.updateValue(e.clientX);
            };
            
            const handlePointerUp = (e) => {
                container.releasePointerCapture(e.pointerId);
                container.removeEventListener("pointermove", handlePointerMove);
                container.removeEventListener("pointerup", handlePointerUp);
            };
            
            container.addEventListener("pointermove", handlePointerMove);
            container.addEventListener("pointerup", handlePointerUp);
        }
    }
}
</script>

<style scoped>
.custom-range-container {
    position: relative;
    width: 100%;
    height: 32px; /* Safe touch area */
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    touch-action: none;
}

.custom-range-track {
    position: relative;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none; /* Let the container handle clicks */
}

.custom-range-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 4px 0 0 4px;
    background: var(--secondary-blue-soft);
}

.custom-range-thumb {
    position: absolute;
    top: 50%;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--secondary-blue-soft);
    border: 2px solid var(--neutral-white);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease;
    z-index: 2;
}

.custom-range-container:hover .custom-range-thumb {
    transform: translate(-50%, -50%) scale(1.1);
}

.custom-range-container:active .custom-range-thumb {
    transform: translate(-50%, -50%) scale(0.95);
}
</style>
