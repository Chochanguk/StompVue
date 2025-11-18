<template>
  <header class="room-header">
    <h1>채팅방 #{{ roomId }}</h1>
  </header>
</template>

<script setup>
const props = defineProps({
  roomId: {
    type: [Number, String],
    required: true,
  },
});
</script>

<style scoped>
.room-header {
  background: #333;
  color: #fff;
  padding: 12px 16px;
  font-weight: bold;
}
</style>
