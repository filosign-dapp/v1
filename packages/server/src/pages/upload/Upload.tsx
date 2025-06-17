import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { CloudUpload, Shield } from 'lucide-react'
import { Card } from '@/src/lib/components/ui/card'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import Icon from '@/src/lib/components/custom/Icon'
import { useNavigate } from '@tanstack/react-router'
import { cn, handleError } from '@/src/lib/utils'
import { useApi } from '@/src/lib/hooks/use-api'
import { formatFileSize, compressFile, encryptFile, sanitizeFile, basicFileChecks } from '@/src/lib/utils/files'

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isError, setIsError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { uploadFile } = useApi()
  const { mutateAsync: uploadFileMutation, isPending: isUploading } = uploadFile

  function handleDragEvents(e: React.DragEvent, isDragging?: boolean) {
    e.preventDefault()
    if (isDragging !== undefined) setIsDragOver(isDragging)
    if (e.type === 'drop') {
      const files = Array.from(e.dataTransfer.files)
      if (files[0]) handleFileUpload(files[0])
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsError(false)
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  async function handleFileUpload(file: File) {
    try {
      basicFileChecks(file);
      const sanitizedFile = sanitizeFile(file);
      const compressedBuffer = await compressFile(sanitizedFile);
      const { encryptedBuffer, secretKey } = await encryptFile(compressedBuffer);
      const result = await uploadFileMutation({
        encryptedBuffer,
        metadata: { name: sanitizedFile.name, type: sanitizedFile.type }
      })

      navigate({
        to: '/link/$cid',
        params: { cid: result.cid },
        search: {
          name: sanitizedFile.name,
          key: secretKey,
          size: formatFileSize(sanitizedFile.size),
        }
      })
    } catch (error) {
      setIsError(true)
      handleError(error)
    }
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Portal</h1>
          </div>
          <p className="text-lg text-muted-foreground">Secure file sharing made simple</p>
        </div>

        {/* Upload Area */}
        <Card className="relative overflow-hidden">
          <motion.div
            className={cn(
              "border-2 border-dashed transition-all duration-200 p-12 rounded-xl cursor-pointer",
              isDragOver && "border-primary bg-primary/5 scale-[1.02]",
              !isDragOver && "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
              isUploading && "pointer-events-none opacity-50",
              isError && "border-destructive bg-destructive/5"
            )}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={(e) => handleDragEvents(e)}
            onClick={() => fileInputRef.current?.click()}
            whileTap={{ scale: 0.99 }}
          >
            {isUploading ? (
              <div className="space-y-2">
                <Icon name="CloudUpload" className="w-16 h-16 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">Uploading...</h3>
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
              onChange={handleFileChange}
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
  )
} 