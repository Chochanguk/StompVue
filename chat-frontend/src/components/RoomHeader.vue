<template>
  <header class="room-header">
    <!-- 뒤로가기 버튼 -->
    <button class="back-btn" @click="$emit('back')">
      <svg
        class="icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>


    <!-- 채팅방 이름 -->
    <div class="room-title">
      {{ roomName }}
    </div>

    <!-- 우측 여백(정렬용) -->
    <div class="right-space"></div>
  </header>
</template>

<script setup>
defineProps({
  roomName: {
    type: String,
    default: "채팅방"
  }
});
</script>

<style scoped>
.room-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 12px;

  background: #ffffff;
  border-bottom: 1px solid #e6e6e6;

  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}

/* 뒤로가기 버튼 */
.back-btn {
  background: none;
  border: none;
  padding: 6px 10px;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;
  transition: background 0.15s;
}

.back-btn:hover {
  background: #f3f3f3;
}

.icon {
  font-size: 20px;
  line-height: 1;
  font-weight: bold;
  color: #444;
}

/* 방 제목 */
.room-title {
  flex: 1;
  text-align: center;

  font-size: 17px;
  font-weight: 600;
  color: #333;

  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 우측 공간 (좌측 아이콘과 균형 맞춤) */
.right-space {
  width: 32px;
}
</style>
