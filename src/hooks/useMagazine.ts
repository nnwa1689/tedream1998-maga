// src/hooks/useMagazine.ts
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhotoSwipe from 'photoswipe'
import Scrollbar from 'smooth-scrollbar'

import { initialCoverData } from '@/data/coverData'
import { createTocData } from '@/data/tocData'
import { initialStories } from '@/data/storiesData'
import { initialBackCoverData } from '@/data/backCoverData'

export function useMagazine() {
    const route = useRoute()
    const router = useRouter()
    const volId = route.params.id as string // 從路由撈出動態 vol_id

    const currentPage = ref<number>(1)
    const coverPhotoRef = ref<HTMLElement | null>(null)
    const isCoverLight = ref<boolean>(false)
    const isCoolDown = ref<boolean>(false)
    const loading = ref<boolean>(true) // 控制全頁面的 Loading 狀態
    const COOL_DOWN_TIME = 800

    let touchStartX = 0
    let touchStartY = 0
    let pswpInstance: PhotoSwipe | null = null

    // 🔒 原封不動使用你原本宣告好的響應式變數
    const stories = reactive(initialStories)
    const coverData = reactive(initialCoverData)
    const backCoverData = reactive(initialBackCoverData)

    /* =========================================================================
       📡 修正後的 API 資料注入邏輯
       ========================================================================= */
    const fetchMagazineData = async (): Promise<void> => {
        try {
            loading.value = true

            // 同步併行發送 4 支 API 請求
            const [coverRes, tocRes, storiesRes, backRes] = await Promise.all([
                fetch(`https://teddream.tw/cms/items/VolCover/${volId}?fields=title,info,image`),
                fetch(`https://teddream.tw/cms/items/TocData/${volId}?fields=noteTitle,noteContent,links.title,links.pageNumber,links.targetPage&deep[links][_sort]=sort`),
                fetch(`https://teddream.tw/cms/items/StoryItem?filter[vol_id][_eq]=${volId}&sort=sort`),
                fetch(`https://teddream.tw/cms/items/BackCover/${volId}?fields=title,subtitle,socials.Socials_id.id,socials.Socials_id.url,socials.Socials_id.name,socials.Socials_id.icon`)
            ])

            // 1. 封面資料：用 Object.assign 覆蓋屬性，並補上完整的資產 URL
            const coverJson = await coverRes.json()

            if (!coverRes.ok || coverRes.status === 404) {
                throw new Error(`[HTTP 404] 找不到該期數`)
            }

            if (coverJson.data) {
                Object.assign(coverData, coverJson.data)
                if (coverJson.data.image) {
                    coverData.image = `https://teddream.tw/cms/assets/${coverJson.data.image}`
                }
            }

            // 門神檢查 B：資料庫內查無此 PK
            if (!coverJson || !coverJson.data) {
                throw new Error('[CMS ERROR] 該期數資料為空')
            }

            // 2. 目錄與序章：同樣更新既有欄位，並將 API 的 links 的 targetPage 轉為數字型別
            const tocJson = await tocRes.json()
            if (tocJson.data) {
                tocData.noteTitle = tocJson.data.noteTitle || ''
                tocData.noteContent = tocJson.data.noteContent || ''
                
                if (tocJson.data.links) {
                    // 🌟 透過轉譯器，將後台傳來的字串，動態綁定為 Vue 的 Live 變數
                    tocData.links = tocJson.data.links.map((link: any) => {
                        // 先複製一份原始的 link 物件欄位
                        const item = { ...link }

                        /* 🎯 狀況一：如果後台 targetPage 填寫了 "totalPages" 關鍵字 */
                        if (String(link.targetPage).trim() === 'totalPages') {
                            Object.defineProperty(item, 'targetPage', {
                                get: () => totalPages.value, // 🔥 動態綁定：每次讀取都回傳最新的總頁數數字
                                enumerable: true,
                                configurable: true
                            })
                        } else {
                            // 如果是正常數字，就維持原樣轉型
                            item.targetPage = Number(link.targetPage)
                        }

                        /* 🎯 狀況二：如果後台 pageNumber 填寫了 "totalPages" 關鍵字，或者你想動態幫它格式化 */
                        if (String(link.pageNumber).trim() === 'totalPages' || String(link.pageNumber).includes('totalPages')) {
                            Object.defineProperty(item, 'pageNumber', {
                                get: () => `P. ${String(totalPages.value).padStart(2, '0')}`, // 🔥 動態計算：輸出如 "P. 05"
                                enumerable: true,
                                configurable: true
                            })
                        }

                        return item
                    })
                }
            }

            // 3. 文章及照片內容：先排空原本的陣列，再重新推入新資料
            // 當 stories 被 push 更新時，底下的 computed 鏈條會自動全部活過來！
            const storiesJson = await storiesRes.json()
            if (storiesJson.data) {
                stories.length = 0 // 乾淨清空
                const mappedStories = storiesJson.data.map((item: any) => ({
                    ...item,
                    image: item.image ? `https://teddream.tw/cms/assets/${item.image}` : '',
                    width: Number(item.width) || 1200,
                    height: Number(item.height) || 800
                }))
                stories.push(...mappedStories)
            }

            // 4. 封底相關資料：寫入基本資料並將巢狀的 M2M 陣列拍平
            const backJson = await backRes.json()
            if (backJson.data) {
                backCoverData.title = backJson.data.title || ''
                backCoverData.subtitle = backJson.data.subtitle || ''
                if (backJson.data.socials) {
                    backCoverData.socials = backJson.data.socials
                        .map((s: any) => s.Socials_id)
                        .filter(Boolean)
                }
            }

        } catch (error) {
            console.error(`載入 Vol [${volId}] 資料失敗:`, error)
            // ⚡ 強制將網址洗回首頁清單，不留髒紀錄
            router.replace('/')
        } finally {
            setTimeout(() => {
                loading.value = false
            }, 2000)
        }
    }

    /* =========================================================================
       🧱 虛擬頁面序列流與後續所有邏輯（通通 100% 維持你原本寫好的設定）
       ========================================================================= */
    const talkStories = computed(() => stories.filter(s => s.type === 'article'))
    const hasTalks = computed(() => talkStories.value.length > 0)

    const pageSequence = computed(() => {
        const seq: Array<{ type: 'cover' | 'toc' | 'talks-menu' | 'portfolio-menu' | 'story' | 'back-cover'; storyIndex?: number }> = [
            { type: 'cover' },
            { type: 'toc' }
        ]
        if (hasTalks.value) {
            seq.push({ type: 'talks-menu' })
            stories.forEach((story, idx) => {
                if (story.type === 'article') {
                    seq.push({ type: 'story', storyIndex: idx })
                }
            })
        }
        seq.push({ type: 'portfolio-menu' })
        stories.forEach((story, idx) => {
            if (story.type === 'gallery' || story.type === 'gallery-left' || !story.type) {
                seq.push({ type: 'story', storyIndex: idx })
            }
        })
        seq.push({ type: 'back-cover' })
        return seq
    })

    const totalPages = computed<number>(() => pageSequence.value.length)

    // 🔒 完美接回你原本的動態目錄工廠變數
    const tocData = reactive(createTocData(totalPages))

    const currentPageType = computed(() => pageSequence.value[currentPage.value - 1]?.type || '')

    const currentStoryIndex = computed<number>(() => {
        const currentConfig = pageSequence.value[currentPage.value - 1]
        return currentConfig && currentConfig.storyIndex !== undefined ? currentConfig.storyIndex : -1
    })

    const isLightBg = computed<boolean>(() => {
        const type = currentPageType.value
        return (
            type === 'toc' || type === 'talks-menu' || type === 'portfolio-menu' || type === 'back-cover' ||
            (type === 'cover' && isCoverLight.value)
        )
    })

    const currentChapterName = computed<string>(() => {
        const type = currentPageType.value
        if (type === 'cover') return '00 / COVER'
        if (type === 'toc') return '01 / INDEX'
        if (type === 'talks-menu') return '02 / TALKS'
        const prefix = hasTalks.value ? '03' : '02'
        if (type === 'portfolio-menu') return `${prefix} / PORTFOLIO`
        if (type === 'story') {
            const currentStory = stories[currentStoryIndex.value]
            if (currentStory) {
                const isArticle = currentStory.type === 'article'
                const chapterPrefix = isArticle ? '02' : prefix
                const sectionLabel = isArticle ? 'TALKS' : 'PORTFOLIO'
                const collectionPart = currentStory.collection ? ` - ${currentStory.collection.toUpperCase()}` : ''
                return `${chapterPrefix} / ${sectionLabel}${collectionPart}`
            }
        }
        return type === 'back-cover' ? (hasTalks.value ? '04 / ABOUT' : '03 / ABOUT') : ''
    })

    const generateCategoryMenu = (storyTypeFilter: (s: any) => boolean) => {
        const categoriesMap: Record<string, number> = {}
        pageSequence.value.forEach((config, index) => {
            if (config.type === 'story' && config.storyIndex !== undefined) {
                const story = stories[config.storyIndex]
                if (story && story.collection && storyTypeFilter(story)) {
                    if (!categoriesMap[story.collection]) {
                        categoriesMap[story.collection] = index + 1
                    }
                }
            }
        })
        return Object.keys(categoriesMap).map((name, index) => {
            const target = categoriesMap[name]
            return {
                name: `${String(index + 1).padStart(2, '0')} / ${name.toUpperCase()}`,
                targetPage: target,
                pageNumber: String(target).padStart(2, '0')
            }
        })
    }

    const talksCategories = computed(() => generateCategoryMenu(s => s.type === 'article'))
    const portfolioCategories = computed(() => generateCategoryMenu(s => s.type === 'gallery' || s.type === 'gallery-left' || !s.type))

    const triggerPageChange = (direction: 'next' | 'prev'): void => {
        if (isCoolDown.value) return
        if (direction === 'next' && currentPage.value < totalPages.value) {
            currentPage.value++
            activateCoolDown()
        } else if (direction === 'prev' && currentPage.value > 1) {
            currentPage.value--
            activateCoolDown()
        }
    }

    const activateCoolDown = (): void => {
        isCoolDown.value = true
        setTimeout(() => { isCoolDown.value = false }, COOL_DOWN_TIME)
    }

    const handleWheel = (e: WheelEvent): void => {
        if (document.querySelector('.pswp--open')) return
        const threshold = 40
        if (Math.abs(e.deltaY) > threshold) {
            triggerPageChange(e.deltaY > 0 ? 'next' : 'prev')
        }
    }

    const handleTouchStart = (e: TouchEvent): void => {
        if (document.querySelector('.pswp--open')) return
        touchStartX = e.touches?.[0]?.clientX ?? 0
        touchStartY = e.touches?.[0]?.clientY ?? 0
    }

    const handleTouchEnd = (e: TouchEvent): void => {
        if (document.querySelector('.pswp--open')) return
        const deltaX = e.changedTouches[0]?.clientX ?? 0 - touchStartX
        const deltaY = e.changedTouches[0]?.clientY ?? 0 - touchStartY
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            triggerPageChange(deltaX < 0 ? 'next' : 'prev')
        }
    }

    const openLightbox = (event: MouseEvent): void => {
        const triggerEl = (event.currentTarget as HTMLElement)
        pswpInstance = new PhotoSwipe({
            dataSource: [{
                src: triggerEl.getAttribute('href') || '',
                width: Number(triggerEl.getAttribute('data-pswp-width')) || 1200,
                height: Number(triggerEl.getAttribute('data-pswp-height')) || 800,
                alt: triggerEl.querySelector('img')?.getAttribute('alt') || ''
            }],
            element: triggerEl,
            bgOpacity: 0.95,
            showHideAnimationType: 'zoom',
            allowPanToNext: false,
            wheelToZoom: true
        } as any)
        pswpInstance.init()
    }

    const checkCoverBrightness = (): void => {
        if (!coverData.image) return
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = coverData.image
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                canvas.width = 100; canvas.height = 100
                ctx.drawImage(img, 0, 0, 100, 100)
                const data = ctx.getImageData(0, 0, 75, 60).data
                let totalLuminance = 0, validPixelCount = 0
                for (let i = 0; i < data.length; i += 4) {
                    if (data?.[i + 3] ?? 0 > 50) {
                        totalLuminance += (0.299 * (data?.[i] ?? 0) + 0.587 * (data?.[i + 1] ?? 0) + 0.114 * (data?.[i + 2] ?? 0))
                        validPixelCount++
                    }
                }
                isCoverLight.value = (validPixelCount > 0 ? totalLuminance / validPixelCount : 128) > 135
            } catch (error) { isCoverLight.value = false }
        }
        img.onerror = () => { isCoverLight.value = false }
    }

    watch(() => coverData.image, () => { if (currentPage.value === 1) checkCoverBrightness() }, { immediate: true })
    watch(currentPage, async (newPage) => { if (newPage === 1) { await nextTick(); checkCoverBrightness() } })

    const nextPage = () => triggerPageChange('next')
    const prevPage = () => triggerPageChange('prev')

    const goToPage = (pageNumber: any) => {
        const target = typeof pageNumber === 'object' ? pageNumber.value : pageNumber
        const numericPage = Number(target)
        if (!isNaN(numericPage) && numericPage >= 1 && numericPage <= totalPages.value) {
            currentPage.value = numericPage
            activateCoolDown()
        }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (document.querySelector('.pswp--open')) return
        if (e.key === 'ArrowRight') nextPage()
        if (e.key === 'ArrowLeft') prevPage()
    }

    const handleBlockWheel = (e: WheelEvent) => {
        const el = e.currentTarget as HTMLElement
        const isScrollingDown = e.deltaY > 0
        const isAtTop = el.scrollTop === 0
        const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1
        if ((isScrollingDown && !isAtBottom) || (!isScrollingDown && !isAtTop)) {
            e.stopPropagation()
        }
    }

    onMounted(async () => {
        window.addEventListener('keydown', handleKeyDown)
        // 🌟 掛載時去要真實資料
        await fetchMagazineData()
        checkCoverBrightness()
    })

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown)
        if (pswpInstance) pswpInstance.destroy()
    })

    const vSmoothScroll = {
        mounted(el: HTMLElement) {
            const sb = Scrollbar.init(el, { damping: 0.06, alwaysShowTracks: false, continuousScrolling: true })
            let scrollTimer: number | null = null

            sb.addListener(() => {
                const track = el.querySelector('.scrollbar-track-y') as HTMLElement
                if (track) {
                    track.classList.add('is-scrolling')
                    if (scrollTimer) clearTimeout(scrollTimer)
                    scrollTimer = window.setTimeout(() => { track.classList.remove('is-scrolling') }, 800)
                }
            })

            const handleWheelPropagation = (e: WheelEvent) => {
                const isAtTop = sb.offset.y <= 0
                const isAtBottom = sb.offset.y >= sb.limit.y
                if (e.deltaY < 0 && isAtTop) return
                if (e.deltaY > 0 && isAtBottom) return
                e.stopPropagation()
            }

            el.addEventListener('wheel', handleWheelPropagation, { passive: false })
                ; (el as any).__scrollbarInstance = sb
                ; (el as any).__scrollTimer = scrollTimer
                ; (el as any).__wheelHandler = handleWheelPropagation
        },
        unmounted(el: HTMLElement) {
            if ((el as any).__wheelHandler) el.removeEventListener('wheel', (el as any).__wheelHandler)
            if ((el as any).__scrollbarInstance) (el as any).__scrollbarInstance.destroy()
            if ((el as any).__scrollTimer) clearTimeout((el as any).__scrollTimer)
        }
    }

    return {
        currentPage, currentPageType, isLightBg, coverPhotoRef, isCoverLight, stories, coverData, backCoverData, tocData, totalPages,
        currentStoryIndex, currentChapterName, talksCategories, portfolioCategories, handleWheel, handleTouchStart, handleTouchEnd, openLightbox,
        nextPage, prevPage, goToPage, handleBlockWheel, vSmoothScroll, loading
    }
}