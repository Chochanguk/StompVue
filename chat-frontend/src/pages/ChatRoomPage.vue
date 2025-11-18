<template>
  <div class="chat-room">
    <RoomHeader :roomId="roomId" />

    <div class="messages">
      <MessageBubble
        v-for="(msg, idx) in chatStore.messages"
        :key="idx"
        :message="msg"
        :isMine="msg.sender === userStore.nickname"
      />
    </div>

    <ChatInput @send="handleSend" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';

import RoomHeader from '@/components/RoomHeader.vue';
import MessageBubble from '@/components/MessageBubble.vue';
import ChatInput from '@/components/ChatInput.vue';

const route = useRoute();
const chatStore = useChatStore();
const userStore = useUserStore();

const roomId = computed(() => Number(route.params.roomId));

onMounted(() => {
  chatStore.connect(roomId.value);
});

onUnmounted(() => {
  chatStore.disconnect();
});

const handleSend = (text) => {
  chatStore.sendText(text);
};
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.messages {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  background: #f0f0f0;
}
</style>
