import { defineStore } from 'pinia';
import { connectStomp, disconnectStomp, sendMessage as sendStompMessage } from '@/utils/stompClient';
import { useUserStore } from './userStore';

export const useChatStore = defineStore('chat', {
  state: () => ({
    roomId: null,
    messages: [],
    connected: false,
  }),
  actions: {
    connect(roomId) {
      if (this.connected && this.roomId === roomId) return;

      this.roomId = roomId;
      this.messages = [];

      connectStomp(roomId, (msg) => {
        this.messages.push(msg);
      });

      this.connected = true;
    },

    disconnect() {
      disconnectStomp();
      this.connected = false;
      this.roomId = null;
      this.messages = [];
    },

    sendText(message) {
      const userStore = useUserStore();
      if (!this.connected || !this.roomId) return;

      sendStompMessage({
        type: 'TALK',
        roomId: this.roomId,
        sender: userStore.nickname || '익명',
        message,
      });
    },
  },
});
