<template>
  <div class="input-group">
    <label :for="id">{{ label }}</label>
    <div class="password-field">
      <input
        ref="input"
        :id="id"
        :name="name"
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :aria-invalid="error ? 'true' : null"
        :aria-describedby="error ? `${id}-error` : null"
        :class="{ 'is-invalid': error }"
        required
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <button
        type="button"
        class="password-toggle"
        :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visible"
        :title="visible ? 'Ocultar senha' : 'Mostrar senha'"
        @click="visible = !visible"
      >
        <span class="material-icons" aria-hidden="true">{{ visible ? "visibility_off" : "visibility" }}</span>
      </button>
    </div>
    <small v-if="error" :id="`${id}-error`" class="password-error" role="alert">{{ error }}</small>
  </div>
</template>

<script>
export default {
  name: "passwordInput",
  props: {
    modelValue: { type: String, default: "" },
    id: { type: String, required: true },
    label: { type: String, required: true },
    name: { type: String, default: null },
    autocomplete: { type: String, default: "current-password" },
    minlength: { type: [Number, String], default: null },
    error: { type: String, default: "" }
  },
  emits: ["update:modelValue"],
  data() {
    return { visible: false };
  },
  methods: {
    focus() {
      this.$refs.input.focus();
    }
  }
};
</script>

<style scoped>
.password-field { position: relative; display: flex; align-items: center; }
.password-field input { padding-right: 48px; }
.password-field input.is-invalid,
.password-field input.is-invalid:focus { border-color: var(--others-red); }
.password-toggle {
  position: absolute;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--neutral-gray-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.password-toggle:hover,
.password-toggle:focus-visible { color: var(--neutral-white); }
.password-toggle:focus-visible { outline: 2px solid var(--primary-primary-blue-high-2); outline-offset: -2px; }
.password-toggle .material-icons { font-size: 22px; }
.password-error { margin-left: 4px; color: var(--others-red); font-size: var(--font-size-5); }
</style>
