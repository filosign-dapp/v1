import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import UploadState from './components/UploadState'
import LinkGeneratedState from './components/LinkGeneratedState'
import api from '@/src/lib/utils/api-client'
import { toast } from 'sonner'
import { encryptFile } from '@/src/lib/utils/encryption'

export type PortalState = 'upload' | 'link-generated'

export interface FileData {
  name: string
  size: string
  link: string
}

export default function Portal() {
  const [currentState, setCurrentState] = useState<PortalState>('upload')
  const [fileData, setFileData] = useState<FileData | null>(null)

  // Handle file upload and link generation
  const handleFileUpload = async (file: File) => {
    try {
      const { encryptedBuffer, secretKey } = await encryptFile(file);

      const result = await api.file.index.$post({
        json: {
          buffer: encryptedBuffer
        }
      })
      
      const parsed = await result.json()
      
      if(!parsed?.success) {
        console.log(parsed?.error);
        toast.error(parsed?.error);
        return;
      }

      const url = `${process.env.BUN_PUBLIC_APP_URL}/download/${parsed?.data?.cid}#${secretKey}`
  
      setFileData({
        name: file.name,
        size: formatFileSize(file.size),
        link: url
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