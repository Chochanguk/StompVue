// stores/chatStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { connectStomp, disconnectStomp, sendMessage } from '@/utils/stompClient';

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    currentRoomId: null,
  }),

  actions: {
    // 📌 MongoDB 히스토리 불러오기
    async loadHistory(roomId) {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}/messages`);

        const data = Array.isArray(res.data)
          ? res.data
          : (Array.isArray(res.data.data) ? res.data.data : []);

        this.messages = data;
      } catch (err) {
        console.error('💥 채팅 히스토리 로드 실패', err);
        this.messages = [];
      }
    },

    // 📌 STOMP 연결
    _connect(roomId) {
      this.currentRoomId = roomId;

      connectStomp(roomId, (msg) => {

        // 🗑 DELETE 타입 실시간 반영
        if (msg.type === "DELETE") {
          const target = this.messages.find(m => m.id === msg.id);
          if (target) {
            target.deleted = true;
            target.deletedAt = new Date();
          }
          return;
        }

        // TALK, ENTER, LEAVE → 그대로 추가
        this.messages.push(msg);
      });
    },

    // 📌 STOMP 연결 종료
    _disconnect() {
      disconnectStomp();
      this.currentRoomId = null;
      this.messages = [];
    },

    // 🚪 방 입장 (히스토리 → STOMP → ENTER 전송)
    async enterRoom({ roomId, nickname }) {
      this.messages = [];
      await this.loadHistory(roomId);
      this._connect(roomId);

      // ENTER 메시지
      setTimeout(() => {
        sendMessage({
          type: 'ENTER',
          roomId,
          sender: nickname,
          message: '',
        });
      }, 200);
    },

    // 🚶 방 퇴장
    leaveRoom({ roomId, nickname }) {
      if (!this.currentRoomId) return;

      sendMessage({
        type: 'LEAVE',
        roomId,
        sender: nickname,
        message: '',
      });

      this._disconnect();
    },

    // 📨 텍스트 + 파일 전송
    async sendMessageWithFile({ roomId, nickname, text, file }) {
      const trimmed = text?.trim();
      if (!trimmed && !file) return;

      let fileUrl = null;
      let fileName = null;

      // 파일 업로드
      if (file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('roomId', roomId);

          const res = await axios.post('/api/chat/files', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          fileUrl = res.data.url;
          fileName = res.data.originalName;
        } catch (err) {
          console.error("💥 파일 업로드 실패", err);
        }
      }

      // 메시지 전송
      sendMessage({
        type: 'TALK',
        roomId,
        sender: nickname,
        message: trimmed || fileName || '',
        fileUrl,
        fileName,
      });
    },

    // 🗑 메시지 단건 소프트 삭제
    async deleteMessage({ messageId, roomId }) {
      try {
        // 삭제 API 호출
        await axios.delete(`/api/chat/messages/${messageId}`, {
          params: { roomId }
        });

        // 프론트 로컬에서도 deleted 처리(즉시 반영)
        const target = this.messages.find(m => m.id === messageId);
        if (target) {
          target.deleted = true;
          target.deletedAt = new Date();
        }
      } catch (err) {
        console.error("💥 메시지 삭제 실패", err);
      }
    },
  },
});
