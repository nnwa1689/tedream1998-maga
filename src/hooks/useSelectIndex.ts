import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // 🌟 引入路由方法

export interface VolCoverItem {
  vol_id: string | number // 🌟 新增 id 欄位以利路由識別
  title: string
  info: string
  image: string | null
  subtitle: string
}

export interface DirectusResponse {
  data: VolCoverItem[]
}

export function useSelectIndex() {
  const router = useRouter() // 🌟 初始化路由實例
  const volList = ref<VolCoverItem[]>([])
  const loading = ref<boolean>(true)
  
  let targetY = 0
  let currentY = 0
  let isAnimating = false
  const ease = 0.06

  const fetchVolumes = async (): Promise<void> => {
    try {
      loading.value = true
      // 🌟 務必在 fields 加上 id
      const response = await fetch('https://teddream.tw/cms/items/VolCover?fields=vol_id,title,info,image,subtitle&sort=-vol_id')
      if (!response.ok) throw new Error(`HTTP 錯誤！狀態碼: ${response.status}`)
      
      const json: DirectusResponse = await response.json()
      volList.value = json.data || []
    } catch (error) {
      console.error('取得集數封面失敗:', error)
    } finally {
      loading.value = false
    }
  }

  // 🌟 點擊直接推送至對應期數頁面
  const selectVolume = (vol: VolCoverItem): void => {
    router.push(`/vol/${vol.vol_id}`) // 🌟 使用 vol_id 作為路由參數
  }

  const setupSmoothScroll = (): void => {
    targetY = window.scrollY
    currentY = window.scrollY
    document.documentElement.classList.add('hide-scrollbar')

    const updateScroll = () => {
      currentY += (targetY - currentY) * ease
      window.scrollTo(0, currentY)
      if (Math.abs(targetY - currentY) > 0.5) {
        requestAnimationFrame(updateScroll)
      } else {
        isAnimating = false
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      targetY = Math.max(0, Math.min(targetY + e.deltaY, maxScroll))
      if (!isAnimating) {
        isAnimating = true
        requestAnimationFrame(updateScroll)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    onUnmounted(() => {
      window.removeEventListener('wheel', onWheel)
      document.documentElement.classList.remove('hide-scrollbar')
    })
  }

  return {
    volList,
    loading,
    fetchVolumes,
    selectVolume,
    setupSmoothScroll
  }
}