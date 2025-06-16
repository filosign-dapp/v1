import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { CloudUpload, Shield } from 'lucide-react'
import { Card } from '@/src/lib/components/ui/card'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import Icon from '@/src/lib/components/custom/Icon'
import { encryptFile } from '@/src/lib/utils/encryption'
import api from '@/src/lib/utils/api-client'
import { useNavigate } from '@tanstack/react-router'
import { handleError } from '@/src/lib/utils'
import { formatFileSize } from '@/src/lib/utils/utils'

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleFileUpload = async (file: File) => {
    try {
      const { encryptedBuffer, secretKey } = await encryptFile(file);

      // const result = await fetch(`${process.env.BUN_PUBLIC_SERVER_URL}/file`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/octet-stream' },
      //   body: encryptedBuffer,
      // });

      const result = await api.file.index.$post({
        form: {
          file: new File([encryptedBuffer], `${file.name}.enc`, { type: file.type }),
        }
      })

      const parsed = await result.json();

      if(!parsed.success) {
        handleError(parsed.error);
        return;
      }
      
      navigate({
        to: '/link/$cid',
        params: { cid: parsed.data.cid },
        search: {
          name: file.name,
          type: file.type,
          key: secretKey,
          size: formatFileSize(file.size),
        }
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setIsUploading(true)
    handleFileUpload(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">   
      <div className="w-full max-w-2xl">
        <div className="space-y-8 text-center">
          {/* Portal Logo/Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Portal</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Secure file sharing made simple
            </p>
          </div>

          {/* Upload Area */}
          <Card className="relative overflow-hidden">
            <motion.div
              className={`
                border-2 border-dashed transition-all duration-200 p-12 rounded-xl cursor-pointer
                ${isDragOver
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                }
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleButtonClick}
              whileTap={{ scale: 0.99 }}
            >
              {isUploading ? (
                <div className="space-y-2">
                  <Icon name="CloudUpload" className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    Uploading...
                  </h3>
                  <TextShimmer duration={3} className="w-full">
                    Securing your file with end-to-end encryption..
                  </TextShimmer>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CloudUpload className="w-16 h-16 mx-auto text-muted-foreground" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Drag & Drop Your File</h3>
                    <p className="text-muted-foreground">
                      or <span className="font-medium text-primary">click to browse</span>
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept="*/*"
              />
            </motion.div>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Files are end-to-end encrypted. We never see your data.</span>
          </div>
        </div>
      </div>
    </div>
  )
} 