import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Download, FileText, Shield, LoaderCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { useParams, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { decryptFile } from '@/src/lib/utils/encryption'
import { formatFileSize } from '@/src/lib/utils/utils'

interface FileMetadata {
  name: string
  size: string
  type: string
}

export default function DownloadPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  
  const { cid } = useParams({ from: '/download/$cid' })
  const { name, type } = useSearch({ from: '/download/$cid' })

  // Extract secret key from URL hash
  const secretKey = window.location.hash.slice(1) // Remove the # symbol

  useEffect(() => {
    const fetchFileMetadata = async () => {
      if (!cid || !secretKey) {
        setError('Invalid download link')
        setIsLoading(false)
        return
      }

      try {
        const result = await fetch(`https://${cid}.ipfs.w3s.link`)
        const buffer = await result.arrayBuffer()

        if(!name || !type) {
          setError('Invalid download link')
          setIsLoading(false)
          return
        }

        const decryptedFile = await decryptFile(buffer, secretKey, name, type);

        setDownloadFile(decryptedFile)
        setFileMetadata({
          name: decryptedFile.name,
          size: formatFileSize(decryptedFile.size),
          type: decryptedFile.type
        })
      } catch (err) {
        setError('Failed to fetch file information')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileMetadata()
  }, [cid, secretKey])

  const handleDownload = async () => {
    if (!cid || !secretKey) {
      toast.error('Invalid download parameters')
      return
    }

    setIsDownloading(true)
    
    try {
      if (!downloadFile) {
        toast.error('File not available for download')
        return
      }

      // Create a URL for the file blob
      const url = URL.createObjectURL(downloadFile)
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFile.name
      document.body.appendChild(link)
      
      // Trigger the download
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('File downloaded successfully')
    } catch (err) {
      toast.error('Failed to download file')
      console.error(err)
    } finally {
      setIsDownloading(false)
    }
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-20 h-20 text-red-500" />
      default:
        return <FileText className="w-20 h-20 text-primary" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <div className="flex items-center gap-3">
          <LoaderCircle className="w-6 h-6 animate-spin" />
          <span>Loading file...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Download Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    )
  }

  if (!fileMetadata) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">File Not Found</h2>
          <p className="text-muted-foreground">The requested file could not be found.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">   
      <div className="w-full max-w-2xl">
        <div className="space-y-8 text-center">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Portal</h1>
            </div>
            <h2 className="text-xl text-muted-foreground">
              Someone shared a file with you
            </h2>
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
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {getFileIcon(fileMetadata.name)}
                </motion.div>
              </div>

              {/* File Details */}
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-foreground break-all">
                  {fileMetadata.name}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {fileMetadata.size}
                </p>
              </div>

              {/* Download Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
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
    </div>
  )
} 