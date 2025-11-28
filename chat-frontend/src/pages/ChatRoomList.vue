<template>
  <div class="room-list">

    <!-- 헤더 -->
    <div class="header">
      <h2>💬 채팅방 목록</h2>

      <button class="nickname-btn" @click="changeNickname">
        {{ userStore.nickname ? `닉네임: ${userStore.nickname}` : "닉네임 설정" }}
      </button>
    </div>

    <!-- 닉네임 없음 -->
    <div v-if="!userStore.nickname" class="warning-box">
      ⚠️ 닉네임을 설정해야 채팅을 이용할 수 있습니다.
    </div>

    <!-- 방 생성 -->
    <div class="create-room">
      <input 
        v-model="newRoomName"
        type="text"
        placeholder="새로운 채팅방 이름 입력"
        :disabled="!userStore.nickname"
      />

      <!-- 비밀번호 + 토글 버튼 컨테이너 -->
      <div class="password-wrapper">
        <input 
          v-model="newRoomPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="비밀번호 (선택)"
          :disabled="!userStore.nickname"
          class="password-input"
        />

      <button class="toggle-btn" @click="showPassword = !showPassword">
        <i :class="showPassword ? 'ri-eye-line' : 'ri-eye-off-line'"></i>
      </button>

      </div>

      <button 
        class="create-btn"
        @click="createRoom"
        :disabled="!userStore.nickname"
      >
        + 만들기
      </button>
    </div>

    <!-- 방 목록 -->
    <ul class="room-container">
      <li 
        v-for="room in rooms" 
        :key="room.roomId"
        class="room-card"
        @click="enterRoom(room)"
        :class="{ disabled: !userStore.nickname }"
      >
        <div class="room-name">
          {{ room.locked ? "🔒 " : "" }}{{ room.name }}
        </div>

        <div class="room-enter">
          {{ userStore.nickname ? '입장 →' : '닉네임 필요' }}
        </div>
      </li>
    </ul>

  </div>
</template>

<script setup>

import { connectStompGlobal } from "@/utils/stompClient";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";

const router = useRouter();
const userStore = useUserStore();

const rooms = ref([]);
const newRoomName = ref("");
const newRoomPassword = ref("");

// 방 목록 불러오기
const loadRooms = async () => {
  try {
    const res = await axios.get("/api/rooms");
    rooms.value = res.data;
  } catch (err) {
    console.error("방 목록 조회 실패:", err);
  }
};

// 방 입장
const enterRoom = async (room) => {

  console.log("CLICKED ROOM:", room);
  console.log("ROOM ID:", room.roomId);

  if (!userStore.nickname) {
    alert("닉네임을 먼저 설정해주세요!");
    return;
  }

  // 🔐 잠금 방이면 비밀번호 요구
  if (room.locked) {
    const inputPw = window.prompt("비밀번호를 입력하세요:");
    if (!inputPw) return;

    try {
      const verify = await axios.post(`/api/rooms/${room.roomId}/verify`, null, {
        params: { password: inputPw }
      });

      if (!verify.data) {
        alert("비밀번호가 틀렸습니다!");
        return;
      }
    } catch (e) {
      alert("비밀번호 검증 오류");
      return;
    }
  }

  router.push({
    name: "room",
    params: {
      roomId: String(room.roomId),
    },
  });
};

// 방 생성
const createRoom = async () => {
  if (!newRoomName.value.trim()) {
    alert("방 이름을 입력하세요.");
    return;
  }

  try {
    const res = await axios.post("/api/rooms", null, {
      params: {
        name: newRoomName.value,
        password: newRoomPassword.value || null,
        creator: userStore.nickname   // ⭐ 방장 정보 추가!
      }
    });


    rooms.value.push(res.data);
    newRoomName.value = "";
    newRoomPassword.value = "";

  } catch (err) {
    console.error("방 생성 실패:", err);
  }
};

// 닉네임 설정
const changeNickname = async () => {
  const input = window.prompt("닉네임을 입력하세요", userStore.nickname);
  if (!input || !input.trim()) return;

  const nickname = input.trim();

  try {
    const check = await axios.get("/api/nickname/check", {
      params: { nickname }
    });

    if (check.data === true) {
      alert("이미 존재하는 닉네임입니다!");
      return;
    }

    await axios.post("/api/nickname/register", null, {
      params: { nickname }
    });

    userStore.setNickname(nickname);
    alert(`닉네임이 ${nickname}으로 설정되었습니다.`);

  } catch (err) {
    console.error("닉네임 설정 실패:", err);
  }
};

const showPassword = ref(false);

onMounted(() => {
  loadRooms();

  connectStompGlobal((deletedRoomId) => {
    rooms.value = rooms.value.filter(r => r.roomId !== Number(deletedRoomId));
  });
});


</script>

<style scoped>
.room-list {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Pretendard", sans-serif;
}

/* 헤더 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 닉네임 버튼 */
.nickname-btn {
  padding: 8px 14px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.nickname-btn:hover {
  background: #f4f4f4;
}

/* 경고 박스 */
.warning-box {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  color: #856404;
  margin-bottom: 16px;
}

/* 방 생성 */
.create-room {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.create-room input,
.password-wrapper {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-right: 6px;
}

.password-input {
  border: none;
  flex: 1;
  padding: 10px;
  font-size: 14px;
  outline: none;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0 6px;
}

.create-btn {
  padding: 8px 4px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

/* 방 카드 */
.room-container {
  list-style: none;
  padding: 0;
}

.room-card {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.15s ease;
}

.room-card:hover {
  background: #f9fafb;
  transform: translateY(-2px);
}

.room-card.disabled {
  background: #f8f8f8;
  cursor: not-allowed;
  opacity: 0.6;
}

.room-name {
  font-size: 15px;
  font-weight: 600;
}

.room-enter {
  font-size: 13px;
  color: #666;
}
</style>
