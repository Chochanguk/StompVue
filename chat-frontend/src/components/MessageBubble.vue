<template>
  <div class="message-wrapper">
    <!-- TALK 메시지 -->
    <div
      v-if="message.type === 'TALK'"
      :class="[
        'bubble',
        isMine ? 'mine' : 'other',
        message.deleted ? 'deleted' : ''
      ]"
    >
      <!-- 삭제된 메시지 -->
      <div v-if="message.deleted" class="deleted-text">
        삭제된 메시지입니다.
      </div>

      <!-- 정상 메시지 -->
      <template v-else>
        <!-- 보낸 사람 -->
        <div class="sender" v-if="!isMine">{{ message.sender }}</div>

        <!-- 텍스트 -->
        <div v-if="message.message" class="text" v-html="linkedText"></div>

        <!-- 유튜브 -->
        <div v-if="youtubeId" class="youtube-preview">
          <a :href="`https://www.youtube.com/watch?v=${youtubeId}`" target="_blank">
            <img :src="`https://img.youtube.com/vi/${youtubeId}/0.jpg`" class="youtube-thumb" />
          </a>
        </div>

        <!-- 네이버 지도 -->
        <div v-if="naverUrl" class="naver-preview">
          <a :href="naverUrl" target="_blank" class="naver-card">
            <img src="/naver-map-icon.png" class="naver-icon" />
            <div class="naver-text">
              <strong>네이버 지도 링크</strong>
              <span>장소 정보를 보려면 클릭하세요</span>
            </div>
          </a>
        </div>

        <!-- 이미지 파일 -->
        <img
          v-if="message.fileUrl && isImageFile(message.fileName)"
          :src="normalizeFileUrl(message.fileUrl)"
          class="file-image"
        />

        <!-- 일반 파일 -->
        <a
          v-if="message.fileUrl && !isImageFile(message.fileName)"
          :href="normalizeFileUrl(message.fileUrl)"
          target="_blank"
          class="file-link"
        >
          📎 {{ message.fileName }}
        </a>
      </template>

      <!-- 시간 -->
      <div class="meta" :class="isMine ? 'meta-mine' : 'meta-other'">
        {{ formatTime(message.sentAt) }}
      </div>
    </div>

    <!-- 🔥 삭제 버튼(말풍선 외부) — 삭제된 메시지에는 절대 표시 X -->
    <button
      v-if="isMine && !message.deleted && message.type === 'TALK'"
      @click="$emit('delete', message)"
      class="delete-btn-outside"
    >
      삭제하기
    </button>

    <!-- SYSTEM 메시지 -->
    <div v-else-if="message.type !== 'TALK'" class="system-message">
      {{ message.sender }}님이 {{ message.type === 'ENTER' ? '입장' : '퇴장' }}했습니다.
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: Object,
  isMine: Boolean,
});

/* URL 자동 링크 */
const autoLink = (text) => {
  if (!text) return "";

  const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

  return escaped.replace(urlRegex, (url) => {
    const href = url.startsWith("http") ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" class="auto-link">${url}</a>`;
  });
};

const linkedText = computed(() => autoLink(props.message.message));

/* 유튜브 ID 추출 */
const youtubeId = computed(() => {
  if (!props.message.message) return null;
  const url = props.message.message;

  let match = url.match(/v=([A-Za-z0-9_-]+)/);
  if (match) return match[1];

  match = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];

  return null;
});

/* 네이버 지도 URL */
const naverUrl = computed(() => {
  if (!props.message.message) return null;

  const regex =
    /(https?:\/\/naver\.me\/[A-Za-z0-9]+)|(https?:\/\/map\.naver\.com\/[^\s]+)/;

  const match = props.message.message.match(regex);
  return match ? match[0] : null;
});

/* 파일 관련 처리 */
const normalizeFileUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("/files/")) return raw;
  if (raw.startsWith("/")) return `/files${raw}`;
  return `/files/${raw}`;
};

const isImageFile = (name) => {
  if (!name) return false;
  return /\.(png|jpg|jpeg|gif)$/i.test(name);
};

/* 시간 */
const formatTime = (t) => {
  if (!t) return "";
  const d = new Date(t);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
};
</script>

<style scoped>
.message-wrapper {
  margin-bottom: 10px;
}

/* 말풍선 */
.bubble {
  max-width: 60%;
  padding: 10px 12px;
  border-radius: 10px;
  word-break: break-word;
}
.mine {
  margin-left: auto;
  background: #d2ffc9;
}
.other {
  margin-right: auto;
  background: #ffffff;
}

/* 삭제된 메시지 스타일 */
.deleted {
  background: #ebebeb !important;
  border: 1px solid #d6d6d6;
}
.deleted-text {
  color: #555;
  font-size: 13px;
  padding: 4px 0;
}

/* 링크 */
.auto-link {
  color: #1976d2;
  text-decoration: underline;
}

/* 유튜브 */
.youtube-preview {
  margin-top: 10px;
}
.youtube-thumb {
  width: 240px;
  border-radius: 8px;
}

/* 네이버 지도 카드 */
.naver-preview {
  margin-top: 12px;
}
.naver-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  background: #e8f3ff;
  border: 1px solid #d0e6ff;
  text-decoration: none;
}
.naver-icon {
  width: 38px;
  height: 38px;
}

/* 이미지 */
.file-image {
  margin-top: 8px;
  max-width: 250px;
  border-radius: 8px;
}

/* 파일 */
.file-link {
  color: #1664c0;
  margin-top: 6px;
  display: block;
}

/* 시간 */
.meta {
  font-size: 11px;
  color: #777;
  margin-top: 6px;
}
.meta-mine {
  text-align: right;
}
.meta-other {
  text-align: left;
}

/* 🔥 삭제 버튼 (말풍선 밖) */
.delete-btn-outside {
  margin-top: 4px;
  margin-left: auto;
  display: block;
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.delete-btn-outside:hover {
  background: #ff4b4b;
}

/* 시스템 메시지 */
.system-message {
  text-align: center;
  color: #777;
  font-size: 12px;
  margin: 8px 0;
}
</style>
