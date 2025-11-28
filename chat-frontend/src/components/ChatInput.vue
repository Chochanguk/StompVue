<!-- ChatInput.vue -->
<template>
  <div class="chat-input">
    <label class="file-btn">
      📎
      <input type="file" hidden @change="onFileChange" />
    </label>

    <div class="file-name" v-if="fileName">
      {{ fileName }}
    </div>

    <input
      v-model="text"
      type="text"
      class="text-input"
      placeholder="메시지를 입력하세요"
      @keyup.enter="onSend"
    />

    <button class="send-btn" @click="onSend">
      전송
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['send']); // text + file 같이 보냄

const text = ref('');
const file = ref(null);
const fileName = ref('');

const onSend = () => {
  const payload = {
    text: text.value.trim(),
    file: file.value,
  };

  if (!payload.text && !payload.file) return;

  emit('send', payload);

  text.value = '';
  file.value = null;
  fileName.value = '';
};

const onFileChange = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  file.value = f;
  fileName.value = f.name;
};
</script>


<style scoped>
.chat-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #ddd;
  background: #fff;
  gap: 8px;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 18px;
  background: #f8f8f8;
}

.text-input {
  flex: 1;
  border-radius: 16px;
  border: 1px solid #ddd;
  padding: 8px 12px;
  outline: none;
}

.send-btn {
  border-radius: 16px;
  border: none;
  padding: 6px 14px;
  cursor: pointer;
  background: #10a37f;
  color: #fff;
  font-size: 13px;
}
</style>
