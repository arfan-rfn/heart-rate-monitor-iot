import { create } from 'zustand'

export interface FileUploadProgress {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  uploadedUrl?: string
  createdAt: number
}

interface UploadStore {
  uploads: Map<string, FileUploadProgress>

  addUpload: (id: string, fileName: string, fileSize: number) => void
  updateProgress: (id: string, progress: number) => void
  setUploadStatus: (id: string, status: FileUploadProgress['status'], error?: string) => void
  setUploadedUrl: (id: string, url: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void
  clearAll: () => void

  getUpload: (id: string) => FileUploadProgress | undefined
  getAllUploads: () => FileUploadProgress[]
  getActiveUploads: () => FileUploadProgress[]
  getTotalProgress: () => number
  hasActiveUploads: () => boolean
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: new Map(),

  addUpload: (id, fileName, fileSize) => set((state) => {
    const newUploads = new Map(state.uploads)
    newUploads.set(id, {
      id,
      fileName,
      fileSize,
      progress: 0,
      status: 'pending',
      createdAt: Date.now()
    })
    return { uploads: newUploads }
  }),

  updateProgress: (id, progress) => set((state) => {
    const newUploads = new Map(state.uploads)
    const upload = newUploads.get(id)
    if (upload) {
      upload.progress = progress
      if (progress > 0 && progress < 100 && upload.status !== 'error') {
        upload.status = 'uploading'
      } else if (progress === 100 && upload.status !== 'error') {
        upload.status = 'completed'
      }
      newUploads.set(id, upload)
    }
    return { uploads: newUploads }
  }),

  setUploadStatus: (id, status, error) => set((state) => {
    const newUploads = new Map(state.uploads)
    const upload = newUploads.get(id)
    if (upload) {
      upload.status = status
      if (error) {
        upload.error = error
      }
      newUploads.set(id, upload)
    }
    return { uploads: newUploads }
  }),

  setUploadedUrl: (id, url) => set((state) => {
    const newUploads = new Map(state.uploads)
    const upload = newUploads.get(id)
    if (upload) {
      upload.uploadedUrl = url
      newUploads.set(id, upload)
    }
    return { uploads: newUploads }
  }),

  removeUpload: (id) => set((state) => {
    const newUploads = new Map(state.uploads)
    newUploads.delete(id)
    return { uploads: newUploads }
  }),

  clearCompleted: () => set((state) => {
    const newUploads = new Map()
    state.uploads.forEach((upload, id) => {
      if (upload.status !== 'completed') {
        newUploads.set(id, upload)
      }
    })
    return { uploads: newUploads }
  }),

  clearAll: () => set({ uploads: new Map() }),

  getUpload: (id) => get().uploads.get(id),

  getAllUploads: () => {
    const uploads = Array.from(get().uploads.values())
    return uploads.sort((a, b) => b.createdAt - a.createdAt)
  },

  getActiveUploads: () => {
    const uploads = Array.from(get().uploads.values())
    return uploads
      .filter(u => u.status === 'uploading' || u.status === 'pending')
      .sort((a, b) => b.createdAt - a.createdAt)
  },

  getTotalProgress: () => {
    const uploads = Array.from(get().uploads.values())
    if (uploads.length === 0) return 0
    const total = uploads.reduce((sum, upload) => sum + upload.progress, 0)
    return Math.round(total / uploads.length)
  },

  hasActiveUploads: () => {
    const uploads = Array.from(get().uploads.values())
    return uploads.some(u => u.status === 'uploading' || u.status === 'pending')
  }
}))