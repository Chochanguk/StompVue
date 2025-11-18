<template>
  <div class="chat-input">
    <input
      v-model="text"
      placeholder="메시지를 입력하세요"
      @keyup.enter="onSend"
    />
    <button @click="onSend">전송</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['send']);
const text = ref('');

const onSend = () => {
  if (!text.value.trim()) return;
  emit('send', text.value.trim());
  text.value = '';
};
</script>

<style scoped>
.chat-input {
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid #ddd;
}
input {
  flex: 1;
  padding: 8px;
}
button {
  padding: 8px 16px;
}
</style>
