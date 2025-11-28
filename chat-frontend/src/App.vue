<template>
  <router-view />
</template>

<script setup>

  import axios from "axios";
  import { useUserStore } from "@/stores/userStore";

  const userStore = useUserStore();

  async function validateNicknameOnStart() {
    const savedNickname = localStorage.getItem("nickname");
    if (!savedNickname) return;

    try {
      const res = await axios.get("/api/nickname/check", {
        params: { nickname: savedNickname }
      });

      // ⚠️ 서버가 true = 이미 사용 중
      if (res.data === true) {
        alert("저장된 닉네임이 이미 사용 중입니다. 새로 설정해주세요.");

        localStorage.removeItem("nickname");
        userStore.setNickname(null);
      }
    } catch (err) {
      console.error("닉네임 검증 실패:", err);
    }
  }

  validateNicknameOnStart();

</script>
