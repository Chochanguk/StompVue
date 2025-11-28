<template>
  <div class="chat-room">

    <!-- 헤더 + 뒤로가기 -->
    <RoomHeader :roomName="roomName" @back="goBack" />

    <!-- 방 정보 / 방장 표시 / 방장 기능 -->
    <div class="room-info-bar">
      <div class="creator-label">
        방장: <strong>{{ roomCreator }}</strong>
      </div>

      <div v-if="isOwner" class="owner-actions">
        <button class="owner-btn delete" @click="deleteRoom">
          🗑 방 삭제
        </button>

        <button class="owner-btn transfer" @click="openTransferModal">
          👑 방장 위임
        </button>
      </div>
    </div>

    <!-- 메시지 목록 -->
    <div class="messages" ref="messagesEl" @scroll="handleScroll">
      <MessageBubble
        v-for="(msg, idx) in chatStore.messages"
        :key="idx"
        :message="msg"
        :isMine="msg.sender === userStore.nickname"
        @delete="deleteMessage"
      />
    </div>

    <!-- 맨 아래로 이동 버튼 -->
    <button
      v-if="!isAtBottom && chatStore.messages.length > 0"
      class="scroll-bottom-btn"
      @click="scrollToBottom"
    >
      ⬇ 맨 아래로
    </button>

    <!-- 메시지 입력 -->
    <ChatInput @send="handleSend" />

    <!-- 방장 위임 모달 -->
    <div v-if="showTransferModal" class="modal-overlay">
      <div class="modal-box">
        <h3>방장 위임</h3>

        <input
          v-model="transferName"
          placeholder="새 방장 닉네임 입력"
        />

        <div class="modal-actions">
          <button @click="confirmTransfer">확인</button>
          <button @click="showTransferModal = false">취소</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  computed,
  ref,
  watch,
  nextTick,
} from "vue";

import { connectStompGlobal } from "@/utils/stompClient";  // 새 함수 필요

import { useRoute, useRouter } from "vue-router";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";

import RoomHeader from "@/components/RoomHeader.vue";
import MessageBubble from "@/components/MessageBubble.vue";
import ChatInput from "@/components/ChatInput.vue";

const route = useRoute();
const router = useRouter();

const chatStore = useChatStore();
const userStore = useUserStore();

const roomId = computed(() => Number(route.params.roomId));
const roomName = computed(() => route.params.roomName);

// 🟢 방 정보 (방장)
const roomCreator = ref(null);

// 🟡 현재 사용자가 방장인가?
const isOwner = computed(() => userStore.nickname === roomCreator.value);

// 🟣 방장 위임 모달
const showTransferModal = ref(false);
const transferName = ref("");

/* 방 정보 조회 */
const loadRoomInfo = async () => {
  try {
    const res = await axios.get(`/api/rooms/${roomId.value}`);
    roomCreator.value = res.data.creatorNickname;
  } catch (err) {
    console.error("방 정보 조회 실패:", err);
  }
};

/* 뒤로가기 */
const goBack = () => {
  router.push("/rooms");
};

/* 스크롤 관련 */
const messagesEl = ref(null);
const isAtBottom = ref(true);

const scrollToBottom = () => {
  const el = messagesEl.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

const handleScroll = () => {
  const el = messagesEl.value;
  if (!el) return;
  const threshold = 80;
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
  isAtBottom.value = distance < threshold;
};

/* 방 입장 */
onMounted(async () => {

  // 🔥 전역 삭제 이벤트 구독
  connectStompGlobal((deletedRoomId) => {
    const currentRoomId = Number(roomId.value);

    console.log("현재 방:", currentRoomId, "삭제된 방:", deletedRoomId);

    if (Number(deletedRoomId) === currentRoomId) {
      alert("⚠️ 방장이 방을 삭제했습니다. 채팅방에서 나갑니다.");
      router.push("/rooms");
    }
  });

  
  // 기존 코드
  await loadRoomInfo();
  const nickname = userStore.nickname;
  await chatStore.enterRoom({ roomId: roomId.value, nickname });
  await nextTick();
  scrollToBottom();
});
/* 방 나가기 */
onBeforeUnmount(() => {
  chatStore.leaveRoom({
    roomId: roomId.value,
    nickname: userStore.nickname,
  });
});

/* 새로운 메시지 들어오면 자동 스크롤 */
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick();
    if (isAtBottom.value) scrollToBottom();
  }
);

/* 메시지 전송 */
const handleSend = ({ text, file }) => {
  chatStore.sendMessageWithFile({
    roomId: roomId.value,
    nickname: userStore.nickname,
    text,
    file,
  });
};

/* 메시지 삭제 */
const deleteMessage = async (msg) => {
  if (msg.sender !== userStore.nickname) {
    alert("본인이 작성한 메시지만 삭제할 수 있습니다.");
    return;
  }

  const ok = window.confirm("이 메시지를 삭제할까요?");
  if (!ok) return;

  await chatStore.deleteMessage({
    messageId: msg.id,
    roomId: roomId.value,
  });
};

/* ⭐ 방 삭제 (방장만 가능) */
const deleteRoom = async () => {
  if (!isOwner.value) return;

  const ok = window.confirm("정말 방을 삭제하시겠습니까?");
  if (!ok) return;

  try {
    await axios.delete(`/api/rooms/${roomId.value}`, {
      params: { nickname: userStore.nickname },
    });

    alert("방이 삭제되었습니다.");
    router.push("/rooms");
  } catch (err) {
    console.error("방 삭제 실패:", err);
    alert("방 삭제 권한이 없습니다.");
  }
};

/* ⭐ 방장 위임 */
const openTransferModal = () => {
  transferName.value = "";
  showTransferModal.value = true;
};

const confirmTransfer = async () => {
  if (!transferName.value.trim()) return;

  try {
    await axios.post(`/api/rooms/${roomId.value}/transfer`, null, {
      params: {
        from: userStore.nickname,
        to: transferName.value.trim(),
      },
    });

    alert("방장이 변경되었습니다.");
    showTransferModal.value = false;

    // 변경된 방장 다시 불러오기
    await loadRoomInfo();
  } catch (err) {
    console.error("방장 위임 실패:", err);
    alert("방장 위임 오류");
  }
};
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 방 정보 바 */
.room-info-bar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.creator-label {
  font-size: 14px;
  color: #444;
}

.owner-actions {
  display: flex;
  gap: 8px;
}

.owner-btn {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.owner-btn.delete {
  background: #ff6b6b;
  color: white;
}

.owner-btn.transfer {
  background: #ffd54f;
}

/* 메시지 영역 */
.messages {
  flex: 1;
  padding: 12px 16px 24px;
  overflow-y: auto;
  background: #f0f0f0;
}

/* 스크롤 아래 버튼 */
.scroll-bottom-btn {
  position: fixed;
  right: 24px;
  bottom: 80px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  z-index: 10;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
}
</style>
