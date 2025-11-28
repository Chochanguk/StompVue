import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    nickname: "",
  }),

  actions: {
    setNickname(name) {
      this.nickname = name;

      if (!name) {
        // null, undefined, "", 빈값이면 완전히 제거
        localStorage.removeItem("nickname");
      } else {
        localStorage.setItem("nickname", name);
      }
    },
  },
});