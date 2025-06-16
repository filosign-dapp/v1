import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Download, FileText, Shield, LoaderCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { useParams, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { decryptFile } from '@/src/lib/utils/encryption'
import { formatFileSize } from '@/src/lib/utils/utils'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import { useApi } from '@/src/lib/hooks/use-api'
import { handleError } from '@/src/lib/utils'

interface FileMetadata {
  name: string
  size: string
  type: string
}

export default function DownloadPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [downloadFile, setDownloadFile] = useState<File | null>(null)

  const { cid } = useParams({ from: '/download/$cid' })
  const { name, type } = useSearch({ from: '/download/$cid' })
  const secretKey = window.location.hash.slice(1)

  const { downloadFile: downloadFileQuery } = useApi()
  const { data: downloadFileData, isLoading: isDownloading, isSuccess, error } = downloadFileQuery(cid)

  useEffect(() => {
    async function fetchFileMetadata() {
      if (!isSuccess) {
        return
      }

      if (!cid || !secretKey || !name || !type) {
        return
      }

      try {
        const decryptedFile = await decryptFile(downloadFileData, secretKey, name, type)

        setDownloadFile(decryptedFile)
        setFileMetadata({
          name: decryptedFile.name,
          size: formatFileSize(decryptedFile.size),
          type: decryptedFile.type
        })
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileMetadata()
  }, [isSuccess])

  async function handleDownload() {
    if (!downloadFile) {
      toast.error('File not available for download')
      return
    }

    try {
      const url = URL.createObjectURL(downloadFile)
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: downloadFile.name
      })

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('File downloaded successfully')
    } catch (err) {
      toast.error('Failed to download file')
      console.error(err)
    }
  }

  function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase()
    const isDocument = ['pdf', 'doc', 'docx', 'txt'].includes(ext || '')
    return <FileText className={`w-20 h-20 ${isDocument ? 'text-red-500' : 'text-primary'}`} />
  }

  function renderStatusCard(icon: React.ReactNode, title: string, message: string) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <Card className="p-8 text-center max-w-md">
          {icon}
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <TextShimmer>Decrypting file...</TextShimmer>
      </div>
    )
  }

  if (error) {
    return renderStatusCard(
      <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />,
      'Download Error',
      error.message
    )
  }

  if (!fileMetadata) {
    return renderStatusCard(
      <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />,
      'File Not Found',
      'The requested file could not be found.'
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Portal</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">Someone shared a file with you</h2>
        </div>

        {/* File Display */}
        <Card className="p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* File Icon */}
            <div className="flex items-center justify-center">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                {getFileIcon(fileMetadata.name)}
              </motion.div>
            </div>

            {/* File Details */}
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground break-all">
                {fileMetadata.name}
              </h3>
              <p className="text-lg text-muted-foreground">{fileMetadata.size}</p>
            </div>

            {/* Download Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                size="lg"
                className="w-full max-w-sm mx-auto h-12 text-lg"
              >
                {isDownloading ? (
                  <>
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </Card>

        {/* Security Footer */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Shared securely with Portal</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>🔒 End-to-end encrypted transfer</p>
            <p>🕒 This link will expire automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
} 