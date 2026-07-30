'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { X, ImagePlus, Loader2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

type CreatePostProps = {
  onClose: () => void
}

export function CreatePost({ onClose }: CreatePostProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<'upload' | 'caption'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStep('caption')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    maxSize: 256 * 1024 * 1024,
    multiple: false,
  })

  const handlePost = async () => {
    if (!file || posting) return
    setPosting(true)
    setUploading(true)

    try {
      // 1. Faylni yuklash
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        toast(err.error || 'Upload muvaffaqiyatsiz', 'error')
        return
      }

      const { url, resourceType } = await uploadRes.json()
      setUploading(false)

      // 2. Post yaratish
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: url,
          mediaType: resourceType === 'video' ? 'video' : 'image',
          caption: caption.trim() || undefined,
        }),
      })

      if (!postRes.ok) {
        toast('Post yaratishda xatolik', 'error')
        return
      }

      toast('Post muvaffaqiyatli ulashildi! 🎉', 'success')
      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      toast('Xatolik yuz berdi', 'error')
    } finally {
      setPosting(false)
      setUploading(false)
    }
  }

  const isVideo = file?.type.startsWith('video/')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={
              step === 'caption'
                ? () => {
                    setStep('upload')
                    setFile(null)
                    setPreview(null)
                  }
                : onClose
            }
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="font-semibold">Yangi post</h2>
          {step === 'caption' ? (
            <button
              onClick={handlePost}
              disabled={posting}
              className="text-blue-500 font-semibold hover:text-blue-600 disabled:opacity-50 flex items-center gap-1 text-sm"
            >
              {posting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {uploading ? 'Yuklanmoqda...' : 'Joylanmoqda...'}
                </>
              ) : (
                'Ulashish'
              )}
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>

        {/* Body */}
        {step === 'upload' ? (
          <div
            {...getRootProps()}
            className={cn(
              'p-12 text-center cursor-pointer transition-colors m-4 rounded-xl border-2 border-dashed',
              isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                : 'border-border hover:border-gray-400 dark:hover:border-gray-600'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <ImagePlus size={28} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Rasm yoki video tanlang</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Faylni bu yerga tashlang yoki bosing
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, GIF, MP4 — max 256MB
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors"
              >
                <Upload size={16} />
                Kompyuterdan tanlash
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row">
            {/* Preview */}
            <div className="relative aspect-square w-full sm:w-64 flex-shrink-0 bg-black overflow-hidden">
              {preview &&
                (isVideo ? (
                  <video src={preview} className="w-full h-full object-cover" />
                ) : (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                ))}
            </div>

            {/* Caption */}
            <div className="flex-1 p-4 flex flex-col">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Caption yozing... (ixtiyoriy)"
                maxLength={2200}
                rows={6}
                className="flex-1 w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground"
              />
              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground">
                  {caption.length}/2200
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
