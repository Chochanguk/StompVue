import { createRouter, createWebHistory } from 'vue-router';

import ChatRoomList from '@/pages/ChatRoomList.vue';
import ChatRoomPage from '@/pages/ChatRoomPage.vue';

const routes = [
  // ✅ 홈페이지는 자동으로 /rooms 로 이동
  { path: '/', redirect: '/rooms' },

  { path: '/rooms', name: 'rooms', component: ChatRoomList },

  {
    path: '/rooms/:roomId/:roomName?',
    name: 'room',
    component: ChatRoomPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
