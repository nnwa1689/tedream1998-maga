<!-- src/App.vue -->
<template>
  <div class="app-stage">
    <RouterView v-slot="{ Component, route }">
      <!-- 🌟 重新啟用 mode="out-in"，確保產生「中間轉折」的時間差 -->
      <transition :name="getTransitionName(route)" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'

/**
 * 🌟 透過這個函式手動幫 TypeScript 做型別斷言 (Type Guard)
 * 確保回傳給 transition name 的絕對是扎扎實實的 string
 */
const getTransitionName = (route: any): string => {
  if (route && route.meta && typeof route.meta.transition === 'string') {
    return route.meta.transition
  }
  return 'fade' // 預設的過場動畫名稱
}
</script>

<style>
/* 🎯 這是全網頁最底層的畫布 */
.app-stage {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #dbdbdb !important; /* 🌟 這樣中間過場真空期露出來的就會是 dbdbdb 灰！ */
}

/* 確保 body 預設背景不出來攪局 */
body {
  background-color: #dbdbdb;
  margin: 0;
}

::selection {    
  background: #1d1d1d;
    color: #ccc;
}
</style>