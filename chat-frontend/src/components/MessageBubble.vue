<template>
  <div :class="['bubble', isMine ? 'mine' : 'other']">
    <div class="sender" v-if="!isMine">{{ message.sender }}</div>
    <div class="text">{{ message.message }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  message: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
});
</script>

<style scoped>
.bubble {
  max-width: 70%;
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 8px;
}
.mine {
  margin-left: auto;
  background: #d1f0ff;
}
.other {
  margin-right: auto;
  background: #fff;
}
.sender {
  font-size: 12px;
  color: #555;
}
.text {
  font-size: 14px;
}
</style>
