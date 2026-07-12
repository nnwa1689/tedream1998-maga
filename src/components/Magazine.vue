<template>
    <div class="magazine" :class="{ 'is-light-bg': isLightBg }" @wheel="handleWheel" @touchstart="handleTouchStart"
        @touchend="handleTouchEnd">

        <div 
            class="magazine-loader-overlay" 
            :class="{ 'is-hidden': !loading }"
            >
            <div class="magazine-spinner"></div>
            <p class="magazine-loader-text">LOADING</p>
        </div>

        <!-- 1. 常駐章節名稱 -->
        <div class="running-footer">
            <span class="chapter-label">{{ currentChapterName }}</span>
        </div>
        
        <!-- 2. 右下角導覽按鈕 -->
        <div class="nav-group">
            <button v-show="currentPage > 1" class="nav-btn prev-btn" @click="prevPage">
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="ios-arrow-fix" />
            </button>
            <RouterLink to="/" class="nav-btn home-btn" title="回到目錄">
                <font-awesome-icon :icon="['fas', 'house']" />
            </RouterLink>
            <button v-show="currentPage < totalPages" class="nav-btn next-btn" @click="nextPage">
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="ios-arrow-fix" />
            </button>
        </div>

        <Transition name="fade" mode="out-in">

            <!-- P1: 封面樣式 -->
            <div v-if="currentPageType === 'cover'" class="page active-page" key="page-1">
                <div class="cover-container">
                    <div ref="coverPhotoRef" class="cover-portrait"
                        :style="{ backgroundImage: `url(${coverData.image})` }"></div>
                    <div class="masthead" v-html="coverData.title"></div>
                    <div class="cover-info">{{ coverData.info }}</div>
                </div>
            </div>

            <!-- P2: 目錄頁樣式 -->
            <div v-else-if="currentPageType === 'toc'" class="page active-page" key="page-2">
                <div class="toc-container">
                    <div class="toc-left">
                        <h2>{{ tocData.noteTitle }}</h2>
                        <p>{{ tocData.noteContent }}</p>
                    </div>
                    <ul class="toc-list">
                        <li v-for="(item, index) in tocData.links" :key="index" class="toc-item"
                            @click="goToPage(item.targetPage)">
                            <div class="toc-link">
                                <span class="toc-title">{{ item.title }}</span>
                                <span class="toc-number">{{ item.pageNumber }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 💡 新增 P_TALKS: TALKS 子選單 (完美沿用你原汁原味的 toc-list 格式與 CSS) -->
            <div v-else-if="currentPageType === 'talks-menu'" class="page active-page" key="page-talks">
                <div class="toc-container">
                    <div class="toc-left">
                        <h2>TALKS</h2>
                        <p>這一個章節，主要呈現一些心中的想法，比較多的文字，請慢慢咀嚼，偶爾也能嚐到一些圖片。</p>
                    </div>
                    <ul class="toc-list">
                        <li v-for="(cat, index) in talksCategories" :key="index" class="toc-item"
                            @click="goToPage(cat.targetPage)">
                            <div class="toc-link">
                                <span class="toc-title">{{ cat.name }}</span>
                                <span class="toc-number">P.{{ cat.pageNumber }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- P3: PORTFOLIO 分類子目錄 -->
            <div v-else-if="currentPageType === 'portfolio-menu'" class="page active-page" key="page-portfolio">
                <div class="toc-container">
                    <div class="toc-left">
                        <h2>PORTFOLIO</h2>
                        <p>本章節主要以照片呈現，文字為輔助，如果你很喜歡看照片而不愛文字，你會喜歡這個章節的，相信我！</p>
                    </div>
                    <ul class="toc-list">
                        <li v-for="(cat, index) in portfolioCategories" :key="index" class="toc-item"
                            @click="goToPage(cat.targetPage)">
                            <div class="toc-link">
                                <span class="toc-title">{{ cat.name }}</span>
                                <span class="toc-number">P.{{ cat.pageNumber }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- P4: 內文故事/專欄頁面 (不論是 article 還是 gallery 皆走此格式，由 currentStoryIndex 抓取正確資料) -->
            <div v-else-if="currentPageType === 'story'" class="page active-page" :key="'story-' + currentStoryIndex">
                <div v-if="stories[currentStoryIndex]" class="gallery-container"
                    :class="{ 'is-article-layout': stories?.[currentStoryIndex]?.type === 'article' }">
                    <!-- 文字區塊（作品頁靠右，文章頁自動變為滿版置中、左對齊） -->
                    <div class="gallery-text">
                        <h3>{{ stories?.[currentStoryIndex]?.title }}</h3>
                        <div v-smooth-scroll
                             class="scrollable-description" 
                             v-html="stories?.[currentStoryIndex]?.description">
                        </div>
                        <div class="gallery-index">
                            <font-awesome-icon icon="fa-solid fa-folder" /> {{ stories?.[currentStoryIndex]?.collection ||
                            'TALKS' }}
                        </div>
                    </div>

                    <!-- 💡 右側圖片區塊：如果是 article 則完全不渲染，不佔用任何排版空間 -->
                    <div v-if="stories?.[currentStoryIndex]?.type !== 'article'" class="gallery-image-wrapper">
                        <a :href="stories?.[currentStoryIndex]?.image" :data-pswp-width="stories?.[currentStoryIndex]?.width"
                            :data-pswp-height="stories?.[currentStoryIndex]?.height" class="pswp-trigger"
                            @click.prevent="openLightbox">
                            <img :src="stories?.[currentStoryIndex]?.image" class="gallery-image-element"
                                alt="Story Image" />
                            <div class="zoom-hint"></div>
                        </a>
                    </div>

                </div>
            </div>

            <!-- P5 封底樣式 -->
            <div v-else-if="currentPageType === 'back-cover'" class="page active-page" key="page-back">
                <div class="back-container">
                    <h3 v-html="backCoverData.title"></h3>
                    <div v-smooth-scroll class="scrollable-description" v-html="backCoverData.subtitle"></div>
                    <div class="social-links">
                        <a v-for="item in backCoverData.socials" :key="item?.id" :href="item?.url" target="_blank">
                            <font-awesome-icon :icon="`${item?.icon}`" /> {{ item?.name }}
                        </a>
                    </div>
                </div>
            </div>

        </Transition>
    </div>
</template>

<script setup lang="ts">
import 'photoswipe/style.css'
import '@/styles/magazine.css'
import { useMagazine } from '@/hooks/useMagazine'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faFolder, faHouse, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
library.add(faInstagram, faEnvelope, faFolder, faHouse, faArrowRight, faArrowLeft)

const {
    currentPage, currentPageType, isLightBg, coverPhotoRef, isCoverLight, stories, coverData, backCoverData, tocData, totalPages,
    currentStoryIndex, currentChapterName, talksCategories, portfolioCategories, handleWheel, handleTouchStart, handleTouchEnd, openLightbox,
    nextPage, prevPage, goToPage, handleBlockWheel, vSmoothScroll, loading
} = useMagazine()
</script>