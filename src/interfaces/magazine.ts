// src/interfaces/magazine.ts
import { type ComputedRef } from 'vue'

export interface CoverData {
  title: string
  info: string
  image: string
}

export interface TocLink {
  title: string
  pageNumber: string | ComputedRef<string>
  targetPage: number | ComputedRef<number> | ComputedRef<ComputedRef<number>>
}

export interface TocData {
  noteTitle: string
  noteContent: string
  links: TocLink[]
}

export interface StoryItem {
  title: string
  description: string
  image: string
  width: number   // PhotoSwipe 物理寬度
  height: number  // PhotoSwipe 物理高度
  collection: string
  type?: 'gallery' | 'article' | 'gallery-left'  // 可選的類型屬性
}

export interface SocialsId {
  id: number
  name: string
  url: string
  icon? : string
}

export interface BackCoverData {
  title: string
  subtitle: string
  socials: SocialsId[]
}