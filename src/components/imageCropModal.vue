<template>
  <modal
    title="Ajustar Foto"
    buttonTitle="Cortar e Salvar"
    button2Title="Cancelar"
    @submitEvent="confirmCrop"
    @cancelEvent="cancelCrop"
    @closeModal="cancelCrop"
  >
    <div class="crop-area">
      <img ref="image" :src="imageSrc" alt="Imagem para cortar" class="crop-target" @load="initCropper" />
    </div>
  </modal>
</template>

<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import modal from "./modal.vue";

export default {
  name: "imageCropModal",
  props: {
    imageSrc: {
      type: String,
      default: ""
    }
  },
  components: {
    modal
  },
  data() {
    return {
      cropper: null
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
      this.$emit("close");
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
.crop-area {
  max-width: 100%;
  max-height: 50vh;
  margin: 0 auto;
  overflow: hidden;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}

.crop-target {
  max-width: 100%;
  display: block;
}
</style>
