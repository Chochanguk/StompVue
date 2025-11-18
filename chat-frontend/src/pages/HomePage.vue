<template>
  <div class="home">
    <h1>채팅 닉네임 설정</h1>

    <input v-model="nickname" placeholder="닉네임 입력" />
    <button @click="enterChat">입장하기</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const nickname = ref('');
const userStore = useUserStore();
const router = useRouter();

const enterChat = () => {
  if (!nickname.value.trim()) return;
  userStore.setNickname(nickname.value.trim());
  router.push('/rooms');
};
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px;
}
input {
  padding: 8px;
  margin: 8px;
}
button {
  padding: 8px 16px;
}
</style>
