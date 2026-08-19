export interface WorkItem {
  workId: string
  status?: string
  sort?: number | null
  title: string
  desc: string
  image: string
  url: string
}

const API_ENDPOINT = 'https://teddream.tw/cms/items/Developments?sort=workId'
const ASSET_BASE_URL = 'https://teddream.tw/cms/assets/'

/**
 * 取得作品列表 API
 */
export const fetchWorksList = async (): Promise<WorkItem[]> => {
  try {
    const response = await fetch(API_ENDPOINT)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const result = await response.json()
    const rawData: WorkItem[] = result.data || []

    // 1. 保險轉為數字進行升冪排序 (1 -> 2 -> 3...)
    // 2. 將 image UUID 自動轉換為完整圖片 API 網址
    return rawData
      .sort((a, b) => Number(a.workId) - Number(b.workId))
      .map(item => ({
        ...item,
        image: item.image && !item.image.startsWith('http')
          ? `${ASSET_BASE_URL}${item.image}?width=500&format=webp&quality=90`
          : item.image
      }))
  } catch (error) {
    console.error('Failed to fetch works list:', error)
    return []
  }
}