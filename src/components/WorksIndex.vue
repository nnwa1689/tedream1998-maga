<template>
  <div class="select-index-container">
    <!-- 頂部文藝導覽列 -->
    <header class="editorial-header">
      <p class="header-intro">一期一會！</p>
      <nav class="header-nav">
        <router-link to="/" class="header-about">PHOTOS</router-link>
      </nav>
    </header>

    <!-- 巨大頁面標題 -->
    <section class="brand-hero">
      <h1 class="giant-title">DEVELOPMENT</h1>
    </section>

    <!-- 狀態標籤橫條列 -->
    <div class="status-bar">
      <span class="bar-left">WORKS</span>
      <span class="bar-right">SOFTWARE / PROJECTS</span>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <p>Loading projects...</p>
    </div>

    <!-- 核心：程式作品清單列表 -->
    <main v-else class="editorial-list">
      <div 
        v-for="work in worksList" 
        :key="work.workId" 
        class="list-row"
        @click="openWorkUrl(work.url)"
        @mouseenter="handleMouseEnter(work)"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- 左側標題與描述 -->
        <div class="text-group">
          <span class="item-info">#{{ work.workId }}</span>
          <h2 class="item-title" v-html="work.title"></h2>
          <p v-if="work.desc" class="item-desc" v-html="work.desc"></p>
        </div>

        <!-- 右側預覽圖（手機端顯示） -->
        <div v-if="work.image" class="image-preview-box">
          <img 
            :src="getImageUrl(work.image)" 
            :alt="work.title"
            loading="lazy"
          />
        </div>
      </div>
    </main>

    <!-- 全域懸浮跟隨滑鼠預覽框（桌機端顯示） -->
    <div 
      v-if="activeImage" 
      class="floating-preview-box"
      :style="{ transform: `translate3d(${mouseX}px, ${mouseY}px, 0)` }"
    >
      <img 
        :src="getImageUrl(activeImage)" 
        :alt="activeTitle"
      />
    </div>
    
    <footer class="footer"> 
      <small>© &nbsp;Teddream All rights reserved.</small> 
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { fetchWorksList, type WorkItem } from '@/data/worksData'
import { useSelectIndex } from '@/hooks/useSelectIndex'
import '@/styles/SelectIndex.css'

const { setupSmoothScroll } = useSelectIndex()

const worksList = ref<WorkItem[]>([])
const loading = ref(true)

const activeImage = ref<string | null>(null)
const activeTitle = ref('')
const mouseX = ref(0)
const mouseY = ref(0)

const getImageUrl = (imageName: string) => {
  if (!imageName) return ''
  if (imageName.startsWith('http')) return imageName
  return `https://teddream.tw/cms/assets/${imageName}?width=500&format=webp&quality=90`
}

const openWorkUrl = (url: string) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

const handleMouseEnter = (work: WorkItem) => {
  if (work.image) {
    activeImage.value = work.image
    activeTitle.value = work.title
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
  try {
    worksList.value = await fetchWorksList()
  } finally {
    loading.value = false
    
    // 🌟 等待 DOM 完全渲染後啟動緩動與觸發尺寸重算
    await nextTick()
    setupSmoothScroll()
    window.dispatchEvent(new Event('resize'))
  }
})
</script>