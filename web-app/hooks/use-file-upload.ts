import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient, APIError } from '@/lib/api/client'
import { toast } from 'sonner'
import { useUploadStore } from '@/stores/upload-store'

interface UploadRequestData {
  fileName: string
  fileType: string
  fileSize: number
  visibility?: 'private' | 'public' | 'unlisted' | 'shared'
  generatePublicUrl?: boolean
}

interface UploadResponse {
  uploadId: string
  uploadUrl: string
  storageKey: string
  expiresAt: string
  maxSize: number
}

interface ConfirmUploadResponse {
  success: boolean
  fileId: string
  url: string
  publicUrl?: string
}

type ProgressCallback = (progress: number) => void

const uploadToStorage = (
  file: File,
  uploadUrl: string,
  onProgress?: ProgressCallback
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
      } else {
        const errorText = xhr.responseText || 'Unknown error'
        console.error('Upload failed:', {
          status: xhr.status,
          statusText: xhr.statusText,
          errorText,
          url: uploadUrl
        })
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => {
      console.error('Upload error: Network error occurred')
      reject(new Error('Network error occurred during upload'))
    })

    xhr.addEventListener('abort', () => {
      console.error('Upload aborted')
      reject(new Error('Upload was aborted'))
    })

    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.send(file)
  })
}

let uploadIdCounter = 0
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${++uploadIdCounter}`
}

export function useFileUpload() {
  const {
    addUpload,
    updateProgress,
    setUploadStatus,
    setUploadedUrl,
    removeUpload,
    clearCompleted,
    clearAll,
    getAllUploads,
    getTotalProgress,
    hasActiveUploads
  } = useUploadStore()

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      uploadId,
      options = {}
    }: {
      file: File
      uploadId: string
      options?: {
        visibility?: 'private' | 'public' | 'unlisted' | 'shared'
        generatePublicUrl?: boolean
      }
    }) => {
      addUpload(uploadId, file.name, file.size)
      setUploadStatus(uploadId, 'uploading')

      try {
        const uploadRequest: UploadRequestData = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          visibility: options.visibility || 'private',
          generatePublicUrl: options.generatePublicUrl || false,
        }

        const uploadResponse = await apiClient.post<UploadResponse>('/upload/request', uploadRequest)
        const { uploadId: serverId, uploadUrl, maxSize } = uploadResponse

        if (file.size > maxSize) {
          throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`)
        }

        await uploadToStorage(file, uploadUrl, (progress) => {
          updateProgress(uploadId, progress)
        })

        const confirmResponse = await apiClient.post<ConfirmUploadResponse>(`/upload/confirm/${serverId}`)

        if (!confirmResponse.success) {
          throw new Error('Upload confirmation failed')
        }

        // Extract data directly from the response
        const { fileId, url, publicUrl } = confirmResponse

        // Set the uploaded URL - prefer publicUrl if available
        const uploadedUrl = publicUrl || url || fileId
        setUploadedUrl(uploadId, uploadedUrl)

        setUploadStatus(uploadId, 'completed')
        toast.success(`${file.name} uploaded successfully!`)

        // Return file data in expected format
        return {
          id: fileId,
          url: url,
          publicUrl: publicUrl,
          metadata: {},
          status: 'completed'
        }
      } catch (error) {
        const errorMessage = error instanceof APIError
          ? error.message
          : error instanceof Error
          ? error.message
          : 'Upload failed'
        setUploadStatus(uploadId, 'error', errorMessage)
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`)
        throw error
      }
    }
  })

  const uploadFile = useCallback(async (
    file: File,
    options: {
      visibility?: 'private' | 'public' | 'unlisted' | 'shared'
      generatePublicUrl?: boolean
    } = {}
  ) => {
    const uploadId = generateUploadId()
    try {
      return await uploadMutation.mutateAsync({ file, uploadId, options })
    } catch (error) {
      return null
    }
  }, [uploadMutation])

  const uploadMultipleFiles = useCallback(async (
    files: FileList | File[],
    options: {
      visibility?: 'private' | 'public' | 'unlisted' | 'shared'
      generatePublicUrl?: boolean
    } = {}
  ) => {
    const fileArray = Array.from(files)
    const results: Array<any> = []

    for (const file of fileArray) {
      const uploadId = generateUploadId()
      try {
        const result = await uploadMutation.mutateAsync({ file, uploadId, options })
        results.push(result)
      } catch (error) {
        results.push(null)
      }
    }

    return results
  }, [uploadMutation])

  const resetUpload = useCallback(() => {
    clearAll()
    uploadMutation.reset()
  }, [clearAll, uploadMutation])

  const uploads = getAllUploads()
  const currentUpload = uploads.find(u => u.status === 'uploading') || uploads[0]

  return {
    uploadFile,
    uploadMultipleFiles,
    resetUpload,
    removeUpload,
    clearCompleted,
    clearAll,

    uploads,
    currentUpload,
    totalProgress: getTotalProgress(),
    hasActiveUploads: hasActiveUploads(),
    isUploading: uploadMutation.isPending || hasActiveUploads(),

    progress: currentUpload?.progress || 0,
    error: uploadMutation.error instanceof Error ? uploadMutation.error.message : null,
    uploadedFile: uploadMutation.data || null,
  }
}