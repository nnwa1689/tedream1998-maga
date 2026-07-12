// src/data/tocData.ts
import { computed, type ComputedRef } from 'vue'
import type { TocData } from '@/interfaces/magazine'

export const createTocData = (totalPages: ComputedRef<number>): TocData => ({
  noteTitle: '',
  noteContent: '',
  links: []
})