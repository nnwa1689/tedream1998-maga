<template>
  <div class="select-index-container">
    <!-- 頂部文藝小引言與 About -->
    <header class="editorial-header">
      <p class="header-intro">ENJOY FREEDOM</p>
      <a href="#about" class="header-about"></a>
    </header>

    <!-- 巨大品牌極簡巨幕標題 -->
    <section class="brand-hero">
      <h1 class="giant-title">TED DREAM</h1>
    </section>

    <!-- 狀態標籤橫條列 -->
    <div class="status-bar">
      <span class="bar-left">VOL.</span>
      <span class="bar-right"></span>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <p>Loading entries...</p>
    </div>

    <!-- 核心：強烈線條感的一體化清單列表 -->
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

      <!-- 🌟 補回：右側封面圖點綴（專供手機端復原顯示） -->
      <div v-if="vol.image" class="image-preview-box">
        <img 
          :src="`https://teddream.tw/cms/assets/${vol.image}?width=500&format=webp&quality=90`" 
          :alt="vol.title"
          loading="lazy"
        />
      </div>
    </div>
  </main>

    <!-- 🌟 新增：全域懸浮跟隨滑鼠的圖片預覽框 -->
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

// 🌟 新增：滑鼠跟隨與圖片狀態管理
const activeImage = ref<string | null>(null)
const activeTitle = ref('')
const mouseX = ref(0)
const mouseY = ref(0)

// 當滑鼠移入選項：紀錄圖片資訊
const handleMouseEnter = (vol: any) => {
  if (vol.image) {
    activeImage.value = vol.image
    activeTitle.value = vol.title
  }
}

// 當滑鼠在選項內移動：即時更新座標（加上 20px 偏移量避免圖片直接壓在游標正下方）
const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX + 20
  mouseY.value = e.clientY + 20
}

// 當滑鼠移出選項：清空圖片，讓預覽框消失
const handleMouseLeave = () => {
  activeImage.value = null
}

onMounted(async () => {
  await fetchVolumes()
  setupSmoothScroll()
})
</script>