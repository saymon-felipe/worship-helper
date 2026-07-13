<template>
  <div class="crop-modal-overlay" v-if="isOpen">
    <div class="crop-modal-container">
      <div class="crop-modal-header">
        <h4>Ajustar Foto</h4>
        <span class="material-icons close-btn" @click="cancelCrop">close</span>
      </div>
      <div class="crop-modal-body">
        <div class="crop-area">
          <img ref="image" :src="imageSrc" alt="Imagem para cortar" class="crop-target" @load="initCropper" />
        </div>
      </div>
      <div class="crop-modal-footer">
        <button class="btn secondary" @click="cancelCrop">Cancelar</button>
        <button class="btn primary" @click="confirmCrop">Cortar e Salvar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
  name: "imageCropModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    imageSrc: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      cropper: null
    }
  },
  watch: {
    isOpen(newVal) {
      if (!newVal) {
        this.destroyCropper();
      }
    }
  },
  methods: {
    initCropper() {
      this.destroyCropper();
      const image = this.$refs.image;
      if (!image) return;
      this.cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        background: false,
        autoCropArea: 0.8,
        responsive: true,
        restore: false,
        checkCrossOrigin: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false
      });
    },
    destroyCropper() {
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = null;
      }
    },
    cancelCrop() {
      this.destroyCropper();
      this.$emit("cancel");
    },
    confirmCrop() {
      if (!this.cropper) return;
      try {
        const canvas = this.cropper.getCroppedCanvas({
          width: 300,
          height: 300
        });
        if (!canvas) return;
        canvas.toBlob((blob) => {
          this.$emit("confirm", blob);
          this.destroyCropper();
        }, 'image/png');
      } catch (err) {
        console.error("Error cropping image:", err);
      }
    }
  },
  beforeUnmount() {
    this.destroyCropper();
  }
}
</script>

<style scoped>
.crop-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(11, 10, 26, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.crop-modal-container {
  background: var(--primary-primary-blue-low);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.crop-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.crop-modal-header h4 {
  margin: 0;
  font-size: var(--font-size-h4);
  font-weight: 700;
  color: var(--neutral-white);
}

.close-btn {
  cursor: pointer;
  color: var(--neutral-gray-medium);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--neutral-white);
}

.crop-modal-body {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.crop-area {
  max-width: 100%;
  max-height: 350px;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.crop-target {
  max-width: 100%;
  display: block;
}

.crop-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
