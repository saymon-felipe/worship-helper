<template>
  <authorizationTemplate>
    <div class="register">
      <div class="register-container">
        <h2>Registro</h2>
        <form action="register" @submit.prevent="register($event)" id="register-form">
          <div class="input-group">
            <label for="name">Nome</label>
            <input type="text" name="nome_usuario" id="name" required>
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" name="email_usuario" id="email" required>
          </div>
          <div class="input-group">
            <label for="senha">Senha</label>
            <input type="password" name="senha_usuario" id="senha" required>
          </div>
          <div class="input-group">
            <label for="repitir-senha">Repita a senha</label>
            <input type="password" id="repitir-senha" required>
          </div>
          <button type="submit" class="btn btn-2" id="register-account-button">Cadastrar</button>
           <div class="informations">
            <p class="font-size-4">Já tem uma conta? <router-link to="/login" class="link">Entrar</router-link></p>
          </div>
          <p class="response">{{ response }}</p>
        </form>
      </div>
      <div class="copyright">
        <p class="font-size-5">Copyright © 2022 Worship helper</p>
      </div>
    </div>
  </authorizationTemplate>
</template>
<script>
import authorizationTemplate from '../templates/authorizationTemplate.vue';
import { globalMethods } from '../js/globalMethods';
import api from '../config/api';
import $ from 'jquery';

export default {
  name: "registerPage",
  mixins: [globalMethods],
  data() {
    return {
      response: ""
    }
  },
  methods: {
    checkIfPasswordsAreSame: function () {
      let passwordInput = $("#senha");
      let repeatPasswordInput = $("#repitir-senha");
      if (passwordInput.val() != repeatPasswordInput.val()) {
        return false;
      }
      return true;
    },
    register: function (event) {
      let self = this;
      let responseElement = $(".response");
      let form = $("#" + event.target.id);
      let button = $("#register-account-button");

      if (!self.checkIfPasswordsAreSame()) {
        self.response = "As senhas não coincidem";
        self.resetResponseClass(responseElement);
        responseElement.css("opacity", 1).addClass("error");
        return;
      }
      
      button.attr("disabled", "disabled");
      let data = form.serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
          obj[item.name] = item.value;
          return obj;
      }, {});
      api.post("/usuario/cadastro", data)
      .then(function (response) {
        self.response = response.data.message;
        self.resetResponseClass(responseElement);
        responseElement.css("opacity", 1).addClass("success");
        self.removeJwtFromLocalStorage();
        self.$router.push("/login");
      })
      .catch(function () {
        self.response = "Erro no cadastro";
        self.resetResponseClass(responseElement);
        responseElement.css("opacity", 1).addClass("error");
      })
      .then(function () {
        button.attr("disabled", false);
      })
    }
  },
  components: {
    authorizationTemplate
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

  #register-account-button:hover {
    background: var(--primary-primary-blue-high);
  }

.copyright {
  text-align: center;
}
</style>
