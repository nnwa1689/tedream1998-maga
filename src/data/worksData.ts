// 1. 定義單一作品的資料結構 (包含 desc)
export interface WorkItem {
  workId: string
  title: string
  desc: string  // 🎯 新增：作品簡短描述
  image: string
  url: string
}

// 2. 靜態 Mock 資料列表
export const mockWorksData: WorkItem[] = [
  {
    workId: '1',
    title: '動潮｜運動中心人潮',
    desc: '總和台灣各地運動中心人潮，快速決定今天要去哪裡運動。',
    image: 'https://raw.githubusercontent.com/nnwa1689/taiwan-sports-counter/refs/heads/main/webapp/taiwan-sports-counter/public/icon-192.png',
    url: 'https://teddream.tw/tsc'
  },
  {
    workId: '2',
    title: 'Suda 速打｜輕量化打卡系統',
    desc: '開源的打卡系統。',
    image: 'https://raw.githubusercontent.com/nnwa1689/suda-punch-ios/refs/heads/main/Suda/Assets.xcassets/Suda.imageset/SudaLogox1.png',
    url: 'https://github.com/nnwa1689/suda-punch-ios'
  }
]

/**
 * 3. 預留 API 介面函式
 */
export const fetchWorksList = async (): Promise<WorkItem[]> => {
  // 未來 API 完成後，JSON 格式只需補上 "desc": "..." 即可無縫接軌
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockWorksData)
    }, 200)
  })
}