<template>
  <authorizationTemplate>
    <div class="login">
      <div class="login-container">
        <h2>Login</h2>
        <form @submit.prevent="login">
          <div class="input-group">
            <label for="email">E-mail</label>
            <input id="email" v-model.trim="email" type="email" autocomplete="username" required>
          </div>
          <div class="input-group">
            <label for="senha">Senha</label>
            <input id="senha" v-model="password" type="password" autocomplete="current-password" required>
          </div>

          <label class="login-option">
            <input v-model="rememberUser" type="checkbox">
            <span>Lembrar meu e-mail neste dispositivo</span>
          </label>
          <label v-if="biometricSupported" class="login-option">
            <input v-model="enableBiometrics" type="checkbox">
            <span>Ativar acesso por biometria neste dispositivo</span>
          </label>

          <button type="submit" class="btn btn-2" id="access-account-button" :disabled="isSubmitting">
            {{ isSubmitting ? "Acessando..." : "Acessar conta" }}
          </button>
          <button v-if="canUseBiometrics" type="button" class="btn biometric-login-button" :disabled="isBiometricLoading" @click="loginWithBiometrics">
            <span class="material-icons">fingerprint</span>
            {{ isBiometricLoading ? "Validando..." : "Entrar com biometria" }}
          </button>

          <div class="informations">
            <p class="font-size-4">Não tem uma conta? <router-link to="/register" class="link">Junte-se a nós</router-link></p>
            <router-link class="font-size-4 link" to="/forgot-password">Esqueci minha senha</router-link>
          </div>
          <p v-if="response" class="response" :class="responseType">{{ response }}</p>
        </form>
      </div>
      <div class="copyright">
        <p class="font-size-5">Copyright © {{ year }} Worship Helper</p>
      </div>
    </div>
  </authorizationTemplate>
</template>

<script>
import authorizationTemplate from "../templates/authorizationTemplate.vue";
import { globalMethods } from "../js/globalMethods";
import api from "../config/api";

const rememberedEmailKey = "wh_remembered_email";

export default {
  name: "loginPage",
  mixins: [globalMethods],
  components: { authorizationTemplate },
  data() {
    const rememberedEmail = localStorage.getItem(rememberedEmailKey) || "";
    return {
      response: "",
      responseType: "",
      email: rememberedEmail,
      password: "",
      rememberUser: Boolean(rememberedEmail),
      enableBiometrics: false,
      biometricSupported: false,
      isSubmitting: false,
      isBiometricLoading: false
    };
  },
  computed: {
    canUseBiometrics() {
      return this.biometricSupported && Boolean(localStorage.getItem(rememberedEmailKey));
    }
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response?.data;
      return typeof data === "string" ? data : data?.error || data?.message || fallback;
    },
    saveRememberedEmail() {
      if (this.rememberUser) {
        localStorage.setItem(rememberedEmailKey, this.email);
      } else {
        localStorage.removeItem(rememberedEmailKey);
      }
    },
    async getWebAuthn() {
      return import("@simplewebauthn/browser");
    },
    async activateBiometrics() {
      const { startRegistration } = await this.getWebAuthn();
      const optionsResponse = await api.post("/usuario/biometria/registro/opcoes");
      const credential = await startRegistration({ optionsJSON: optionsResponse.data.returnObj });
      await api.post("/usuario/biometria/registro/verificar", { credential });
    },
    async login() {
      this.isSubmitting = true;
      this.response = "";
      try {
        const response = await api.post("/usuario/login", {
          email_usuario: this.email,
          senha_usuario: this.password
        });

        if (this.enableBiometrics) this.rememberUser = true;
        this.saveRememberedEmail();
        this.setJwtInLocalStorage(response.data.returnObj);
        if (this.enableBiometrics && this.biometricSupported) {
          try {
            await this.activateBiometrics();
          } catch (error) {
            console.warn("Não foi possível ativar a biometria:", error);
          }
        }
        this.$router.push("/home");
      } catch (error) {
        this.response = this.getErrorMessage(error, "Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.");
        this.responseType = "error";
      } finally {
        this.isSubmitting = false;
      }
    },
    async loginWithBiometrics() {
      const rememberedEmail = localStorage.getItem(rememberedEmailKey);
      if (!rememberedEmail) return;

      this.isBiometricLoading = true;
      this.response = "";
      try {
        const { startAuthentication } = await this.getWebAuthn();
        const optionsResponse = await api.post("/usuario/biometria/login/opcoes", { email_usuario: rememberedEmail });
        const credential = await startAuthentication({ optionsJSON: optionsResponse.data.returnObj });
        const response = await api.post("/usuario/biometria/login/verificar", {
          email_usuario: rememberedEmail,
          credential
        });
        this.setJwtInLocalStorage(response.data.returnObj);
        this.$router.push("/home");
      } catch (error) {
        this.response = this.getErrorMessage(error, "Não foi possível validar a biometria.");
        this.responseType = "error";
      } finally {
        this.isBiometricLoading = false;
      }
    }
  },
  async mounted() {
    try {
      if (!window.PublicKeyCredential || typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function") {
        return;
      }
      this.biometricSupported = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      this.biometricSupported = false;
    }
  }
};
</script>

<style>
.login-container { margin-top: 2rem; }
.informations { margin: 5px 0 10px; }
#access-account-button { margin: 1rem 0; background: var(--primary-primary-blue-high-2); color: var(--neutral-white); }
#access-account-button:hover { background: var(--primary-primary-blue-high); }
.login-option { display: flex; align-items: center; gap: 8px; margin-top: 10px; color: var(--neutral-gray-medium); font-size: var(--font-size-5); cursor: pointer; }
.login-option input { accent-color: var(--secondary-blue-soft); }
.biometric-login-button { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin: 0 0 1rem; border: 1px solid rgba(56, 182, 255, .35); background: rgba(56, 182, 255, .08); color: var(--secondary-blue-soft); }
.biometric-login-button:disabled { opacity: .7; cursor: wait; }
.login .response { opacity: 1; visibility: visible; display: block; }
.response.error { color: var(--others-red); }
.copyright { text-align: center; }
</style>
