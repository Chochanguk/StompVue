import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '@/pages/HomePage.vue';
import ChatRoomList from '@/pages/ChatRoomList.vue';
import ChatRoomPage from '@/pages/ChatRoomPage.vue';

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/rooms', name: 'rooms', component: ChatRoomList },
  { path: '/rooms/:roomId', name: 'room', component: ChatRoomPage, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
