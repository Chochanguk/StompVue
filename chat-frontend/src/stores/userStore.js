import { defineStore } from 'pinia';

const NICKNAME_KEY = 'nickname';

export const useUserStore = defineStore('user', {
  state: () => ({
    nickname: localStorage.getItem(NICKNAME_KEY) || '',
  }),
  actions: {
    setNickname(name) {
      this.nickname = name;
      localStorage.setItem(NICKNAME_KEY, name);
    },
  },
});
