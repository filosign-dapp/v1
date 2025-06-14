import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import UploadState from './components/UploadState'
import LinkGeneratedState from './components/LinkGeneratedState'
import DownloadState from './components/DownloadState'
import api from '@/src/lib/utils/api-client'
import { toast } from 'sonner'


export type PortalState = 'upload' | 'link-generated' | 'download'

export interface FileData {
  name: string
  size: string
  link: string
}

export default function Portal() {
  const [currentState, setCurrentState] = useState<PortalState>('upload')
  const [fileData, setFileData] = useState<FileData | null>(null)

  // Simulate file upload and link generation
  const handleFileUpload = async (file: File) => {
    try {
      const result = await api.file.index.$post({
        form: {
          file: file
        }
      })
      
      const parsed = await result.json()
      
      if(!parsed.success) {
        console.log(parsed?.error);
        toast.error(parsed?.error);
        return;
      }
      
      console.log(parsed?.data)
  
      setFileData({
        name: file.name,
        size: formatFileSize(file.size),
        link: `https://portal.link/${generateShortId()}`
      })
      setCurrentState('link-generated')
    } catch (error) {
      toast.error("Failed to upload file");
      console.log(error);
    }
  }

  const handleUploadAnother = () => {
    setCurrentState('upload')
    setFileData(null)
  }

  // For demonstration - normally this would be determined by URL/route params
  const handleViewDownload = () => {
    setCurrentState('download')
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">   
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {currentState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadState 
                onFileUpload={handleFileUpload}
                onViewDownload={handleViewDownload}
              />
            </motion.div>
          )}

          {currentState === 'link-generated' && fileData && (
            <motion.div
              key="link-generated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LinkGeneratedState 
                fileData={fileData}
                onUploadAnother={handleUploadAnother}
                onViewDownload={handleViewDownload}
              />
            </motion.div>
          )}

          {currentState === 'download' && (
            <motion.div
              key="download"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DownloadState 
                fileData={fileData || { 
                  name: 'My-Secret-Document.pdf', 
                  size: '14.8 MB', 
                  link: 'https://portal.link/demo' 
                }}
                onBackToUpload={handleUploadAnother}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const segments = Array.from({ length: 4 }, () => 
    Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  )
  return segments.join('-')
} 