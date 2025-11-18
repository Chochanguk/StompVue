<template>
  <div class="room-list">
    <h2>채팅방 목록</h2>
    <ul>
      <li v-for="room in rooms" :key="room.id" @click="enterRoom(room.id)">
        {{ room.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const rooms = [
  { id: 1, name: '채팅방 #1' },
  { id: 2, name: '채팅방 #2' },
  { id: 3, name: '채팅방 #3' },
];

const enterRoom = (roomId) => {
  router.push(`/rooms/${roomId}`);
};
</script>

<style scoped>
.room-list {
  padding: 16px;
}
li {
  list-style: none;
  padding: 8px;
  border: 1px solid #ddd;
  margin-bottom: 8px;
  cursor: pointer;
}
li:hover {
  background: #f5f5f5;
}
</style>
