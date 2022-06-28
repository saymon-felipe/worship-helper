<template>
  <authorizationTemplate>
    <div class="login">
      <div class="login-container">
        <h2>Login</h2>
        <form action="login" @submit.prevent="login($event)" id="login-form">
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" name="email_usuario" id="email" required>
          </div>
          <div class="input-group">
            <label for="senha">Senha</label>
            <input type="password" name="senha_usuario" id="senha" required>
          </div>
          <button type="submit" class="btn btn-2" id="access-account-button">Acessar conta</button>
          <div class="informations">
            <p class="font-size-4">Não tem uma conta? <router-link to="/register" class="link">Junte-se a nós</router-link></p>
            <router-link class="font-size-4 link" to="/forgot-password">Esqueci minha senha</router-link>
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
  name: "loginPage",
  mixins: [globalMethods],
  data() {
    return {
      response: ""
    }
  },
  methods: {
    login: function (event) {
      let self = this;
      let responseElement = $(".response");
      let form = $("#" + event.target.id);
      let button = $("#access-account-button");
      button.attr("disabled", "disabled");
      let data = form.serializeArray().reduce(function (obj, item) { // Pega todos os dados do formulário e coloca em um objeto.
          obj[item.name] = item.value;
          return obj;
      }, {});
      api.post("/usuario/login", data)
      .then(function (response) {
        let token = response.data.token;
        self.setJwtInLocalStorage(token);
        self.response = response.data.message;
        self.resetResponseClass(responseElement);
        responseElement.css("opacity", 1).addClass("success");
        self.$router.push("/home");
      })
      .catch(function (error) {
        let errorMessage = error.response.data.message;
        if (errorMessage != null || errorMessage != undefined) {
          self.response = errorMessage;
          self.resetResponseClass(responseElement);
          responseElement.css("opacity", 1).addClass("error");
        }
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
.login-container {
  margin-top: 2rem;
}
.informations {
  margin: 5px 0 10px;
}
#access-account-button {
  margin: 1rem 0;
  background: var(--primary-primary-blue-high-2);
  color: var(--neutral-white);
}

  #access-account-button:hover {
    background: var(--primary-primary-blue-high);
  }

.copyright {
  text-align: center;
}
</style>
