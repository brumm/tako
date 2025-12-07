import { create } from 'zustand'
import { HoverFile, PreviewFile } from './types'

type Store = {
  previewedFile: PreviewFile | null
  hoveredFile: HoverFile | null
  onHoverFile: (file: HoverFile) => void
  onPreviewFile: (file: PreviewFile | null) => void
}

export const useTakoStore = create<Store>()((set) => ({
  previewedFile: null,
  hoveredFile: null,
  onHoverFile: (file) => set({ hoveredFile: file }),
  onPreviewFile: (file) => set({ previewedFile: file }),
}))
