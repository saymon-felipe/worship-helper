<template>
  <authorizationTemplate>
    <div class="password-flow">
      <div class="password-flow-container">
        <span class="material-icons password-flow-icon">vpn_key</span>
        <h2>Criar nova senha</h2>
        <p class="password-flow-description">Defina uma nova senha para sua conta. Este link só pode ser usado uma vez.</p>

        <form v-if="!completed" @submit.prevent="resetPassword">
          <div class="input-group">
            <label for="reset-password-email">E-mail</label>
            <input id="reset-password-email" v-model.trim="email" type="email" autocomplete="email" required>
          </div>
          <div class="input-group">
            <label for="new-password">Nova senha</label>
            <input id="new-password" v-model="password" type="password" minlength="6" autocomplete="new-password" required>
          </div>
          <div class="input-group">
            <label for="confirm-password">Confirme a nova senha</label>
            <input id="confirm-password" v-model="passwordConfirmation" type="password" minlength="6" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn btn-2 password-flow-button" :disabled="isSubmitting || !token">
            {{ isSubmitting ? "Salvando..." : "Redefinir senha" }}
          </button>
        </form>

        <div v-if="completed" class="password-flow-success">
          <span class="material-icons">check_circle</span>
          <p>{{ response }}</p>
        </div>
        <p v-else-if="response" class="response error">{{ response }}</p>
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
  name: "resetPasswordPage",
  components: { authorizationTemplate },
  mixins: [globalMethods],
  data() {
    return {
      email: typeof this.$route.query.email === "string" ? this.$route.query.email : "",
      token: typeof this.$route.query.token === "string" ? this.$route.query.token : "",
      password: "",
      passwordConfirmation: "",
      response: "",
      completed: false,
      isSubmitting: false
    };
  },
  methods: {
    async resetPassword() {
      if (!this.token) {
        this.response = "Este link é inválido. Solicite uma nova redefinição de senha.";
        return;
      }
      if (this.password !== this.passwordConfirmation) {
        this.response = "As senhas não coincidem.";
        return;
      }

      this.isSubmitting = true;
      this.response = "";
      try {
        const response = await api.post("/usuario/redefinir-senha", {
          email_usuario: this.email,
          token: this.token,
          senha_usuario: this.password
        });
        this.response = response.data.message;
        this.completed = true;
        this.password = "";
        this.passwordConfirmation = "";
      } catch (error) {
        this.response = error.response?.data?.error || "Não foi possível redefinir a senha.";
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
.password-flow-button:disabled { opacity: .7; cursor: not-allowed; }
.password-flow-back { display: inline-block; margin-top: 1rem; }
.password-flow-success { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: 1px solid rgba(56, 182, 255, .25); background: rgba(56, 182, 255, .08); border-radius: var(--radius-md); color: var(--neutral-gray-high); line-height: 1.5; }
.password-flow-success .material-icons { color: var(--secondary-blue-soft); }
.response.error { color: var(--others-red); }
.copyright { text-align: center; margin-top: 2rem; }
</style>
