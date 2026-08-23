<template>
  <div class="select-index-container">
    <!-- 頂部文藝小引言與 Works 頁面導覽 -->
    <header class="editorial-header">
      <p class="header-intro">一期一會！</p>
      <nav class="header-nav">
        <!-- 🎯 點擊前往程式開發作品頁 -->
        <router-link to="/development" class="header-about">DEVELOPMENT</router-link>
      </nav>
    </header>

    <!-- 巨大品牌極簡巨幕標題 -->
    <section class="brand-hero">
      <h1 class="giant-title">TED DREAM</h1>
    </section>

    <!-- 狀態標籤橫條列 -->
    <div class="status-bar">
      <!-- 🎯 調整為照片/雜誌專屬標示 -->
      <span class="bar-left">VOL.</span>
      <span class="bar-right">PHOTOGRAPHY</span>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <p>Loading entries...</p>
    </div>

    <!-- 核心：照片/雜誌清單列表 -->
    <main v-else class="editorial-list">
      <div 
        v-for="(vol, index) in volList" 
        :key="index" 
        class="list-row"
        @click="selectVolume(vol)"
        @mouseenter="handleMouseEnter(vol)"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- 左側文字群組 -->
        <div class="text-group">
          <span class="item-info">{{ vol.info }}</span>
          <h2 class="item-title" v-html="vol.subtitle"></h2>
        </div>

        <!-- 右側封面圖點綴（專供手機端顯示） -->
        <div v-if="vol.image" class="image-preview-box">
          <img 
            :src="`https://teddream.tw/cms/assets/${vol.image}?width=500&format=webp&quality=90`" 
            :alt="vol.title"
            loading="lazy"
          />
        </div>
      </div>
    </main>

    <!-- 全域懸浮跟隨滑鼠的圖片預覽框 -->
    <div 
      v-if="activeImage" 
      class="floating-preview-box"
      :style="{ transform: `translate3d(${mouseX}px, ${mouseY}px, 0)` }"
    >
      <img 
        :src="`https://teddream.tw/cms/assets/${activeImage}?width=500&format=webp&quality=90`" 
        :alt="activeTitle"
      />
    </div>
    
    <footer class="footer"> 
      <small>© &nbsp;Teddream All rights reserved.</small> 
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSelectIndex } from '@/hooks/useSelectIndex'
import '@/styles/SelectIndex.css'

const { volList, loading, fetchVolumes, selectVolume, setupSmoothScroll } = useSelectIndex()

const activeImage = ref<string | null>(null)
const activeTitle = ref('')
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseEnter = (vol: any) => {
  if (vol.image) {
    activeImage.value = vol.image
    activeTitle.value = vol.title
  }
}

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX + 20
  mouseY.value = e.clientY + 20
}

const handleMouseLeave = () => {
  activeImage.value = null
}

onMounted(async () => {
  await fetchVolumes()
  setupSmoothScroll()
})
</script>