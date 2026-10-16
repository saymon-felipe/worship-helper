<template>
  <authorizationTemplate>
    <div class="register">
      <div class="register-container">
        <h2>Registro</h2>
        <form @submit.prevent="register" id="register-form">
          <div class="input-group">
            <label for="name">Nome</label>
            <input type="text" id="name" v-model.trim="name" autocomplete="name" required>
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model.trim="email" autocomplete="email" required>
          </div>
          <passwordInput id="senha" label="Senha" v-model="password" autocomplete="new-password" />
          <passwordInput
            id="repitir-senha"
            label="Repita a senha"
            v-model="passwordConfirmation"
            autocomplete="new-password"
            :error="passwordsMismatch ? 'As senhas não coincidem' : ''"
          />
          <button type="submit" class="btn btn-2" id="register-account-button" :disabled="isSubmitting || passwordsMismatch">
            {{ isSubmitting ? "Cadastrando..." : "Cadastrar" }}
          </button>
           <div class="informations">
            <p class="font-size-4">Já tem uma conta? <router-link to="/login" class="link">Entrar</router-link></p>
          </div>
          <p v-if="response" class="response" :class="responseType">{{ response }}</p>
        </form>
      </div>
      <div class="copyright">
        <p class="font-size-5">Copyright © {{ year }} Worship helper</p>
      </div>
    </div>
  </authorizationTemplate>
</template>
<script>
import authorizationTemplate from '../templates/authorizationTemplate.vue';
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import passwordInput from '../components/passwordInput.vue';

export default {
  name: "registerPage",
  mixins: [globalMethods],
  data() {
    return {
      response: "",
      responseType: "",
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      isSubmitting: false
    }
  },
  computed: {
    // Só acusa divergência depois que a confirmação começou a ser digitada.
    passwordsMismatch() {
      return this.passwordConfirmation !== "" && this.password !== this.passwordConfirmation;
    }
  },
  methods: {
    async register() {
      if (this.password !== this.passwordConfirmation) {
        this.response = "As senhas não coincidem";
        this.responseType = "error";
        return;
      }

      this.isSubmitting = true;
      this.response = "";
      try {
        await api.post("/usuario/cadastro", {
          nome_usuario: this.name,
          email_usuario: this.email,
          senha_usuario: this.password
        });
        this.removeJwtFromLocalStorage();
        // O e-mail vai no state do histórico (não na URL) para o login já abrir preenchido.
        this.$router.push({ path: "/login", state: { registeredEmail: this.email } });
      } catch (error) {
        console.log(error);
        this.response = "Erro no cadastro";
        this.responseType = "error";
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  components: {
    authorizationTemplate,
    passwordInput
  },
  mounted() {
    this.email = typeof this.$route.query.email === "string" ? this.$route.query.email : "";
  },
  watch: {
    "$route.query.email"(email) {
      this.email = typeof email === "string" ? email : "";
    }
  }
}
</script>
<style>
.register {
  padding: 20px 0;
}
.register-container {
  margin-top: 2rem;
}
.informations {
  margin: 5px 0 10px;
}
#register-account-button {
  margin: 1rem 0;
  background: var(--primary-primary-blue-high-2);
  color: var(--neutral-white);
}

#register-account-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.register .response {
  opacity: 1;
}

  #register-account-button:hover {
    background: var(--primary-primary-blue-high);
  }

.copyright {
  text-align: center;
}
</style>
