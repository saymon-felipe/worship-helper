<template>
  <authorizationTemplate>
    <div class="password-flow">
      <div class="password-flow-container">
        <span class="material-icons password-flow-icon">lock_reset</span>
        <h2>Esqueci minha senha</h2>
        <p class="password-flow-description">Informe seu e-mail para receber um link seguro de redefinição.</p>

        <form v-if="!sent" @submit.prevent="requestReset">
          <div class="input-group">
            <label for="reset-email">E-mail</label>
            <input id="reset-email" v-model.trim="email" type="email" autocomplete="email" required>
          </div>
          <button type="submit" class="btn btn-2 password-flow-button" :disabled="isSubmitting">
            {{ isSubmitting ? "Enviando..." : "Enviar link" }}
          </button>
        </form>

        <div v-else class="password-flow-success">
          <span class="material-icons">mark_email_read</span>
          <p>{{ response }}</p>
        </div>

        <p v-if="!sent && response" class="response error">{{ response }}</p>
        <router-link class="font-size-4 link password-flow-back" to="/login">Voltar para o login</router-link>
      </div>
      <div class="copyright"><p class="font-size-5">Copyright © {{ year }} Worship Helper</p></div>
    </div>
  </authorizationTemplate>
</template>

<script>
import authorizationTemplate from "../templates/authorizationTemplate.vue";
import { globalMethods } from "../js/globalMethods";
import api from "../config/api";

export default {
  name: "forgotPasswordPage",
  components: { authorizationTemplate },
  mixins: [globalMethods],
  data() {
    return { email: "", response: "", sent: false, isSubmitting: false };
  },
  methods: {
    async requestReset() {
      this.isSubmitting = true;
      this.response = "";
      try {
        const response = await api.post("/usuario/esqueci-senha", { email_usuario: this.email });
        this.response = response.data.message;
        this.sent = true;
      } catch (error) {
        this.response = error.response?.data?.error || "Não foi possível enviar o link. Tente novamente.";
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.password-flow { padding: 20px 0; }
.password-flow-container { margin-top: 2rem; }
.password-flow-icon { display: block; color: var(--secondary-blue-soft); font-size: 36px; margin-bottom: 10px; }
.password-flow-description { color: var(--neutral-gray-medium); line-height: 1.5; margin: 0 0 1.5rem; }
.password-flow-button { width: 100%; margin: 1rem 0; background: var(--primary-primary-blue-high-2); color: var(--neutral-white); }
.password-flow-button:disabled { opacity: .7; cursor: wait; }
.password-flow-back { display: inline-block; margin-top: 1rem; }
.password-flow-success { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid rgba(56, 182, 255, .25); background: rgba(56, 182, 255, .08); border-radius: var(--radius-md); color: var(--neutral-gray-high); line-height: 1.5; }
.password-flow-success .material-icons { color: var(--secondary-blue-soft); }
.response.error { color: var(--others-red); }
.copyright { text-align: center; margin-top: 2rem; }
</style>
