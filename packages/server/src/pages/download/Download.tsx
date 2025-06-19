import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Download, FileText, Shield, LoaderCircle, AlertCircle, Upload, Package } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useApi } from '@/src/lib/hooks/use-api'
import { handleError, logger } from '@/src/lib/utils'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import { formatFileSize, decompressFile, decryptFile } from '@/src/lib/utils/files'

interface FileItem {
  file: File
  name: string
  size: string
}

export default function DownloadPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [fileItems, setFileItems] = useState<FileItem[]>([])
  const [totalSize, setTotalSize] = useState<string>('')

  const { cid } = useParams({ from: '/download/$cid' })
  const { name } = useSearch({ from: '/download/$cid' })
  const secretKey = window.location.hash.slice(1)

  const { downloadFiles } = useApi()
  const { data: buffers, status: downloadStatus, error } = downloadFiles(cid)

  useEffect(() => {
    async function fetchFileMetadata() {
      if (downloadStatus !== 'success') {
        logger("Waiting for file to be downloaded...");
        return;
      }

      try {
        let totalSize = 0
        const fileItems: FileItem[] = []
        await Promise.all(buffers.map(async (item) => {
          const decryptedBuffer = await decryptFile(item.buffer, secretKey);
          const decompressedBuffer = await decompressFile(decryptedBuffer);
          const file = new File([decompressedBuffer], item.name)
          fileItems.push({ file, name: item.name, size: formatFileSize(file.size) })
          totalSize += file.size
        }))
        setFileItems(fileItems)
        setTotalSize(formatFileSize(totalSize))
      } catch (err) {
        handleError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFileMetadata()
  }, [downloadStatus, buffers, secretKey, name])

  async function handleDownloadFile(fileItem: FileItem) {
    try {
      const url = URL.createObjectURL(fileItem.file)
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: fileItem.name
      })

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${fileItem.name} downloaded successfully`);

      window?.gtag?.('event', 'download', {
        event_category: 'download',
        event_label: fileItem.name,
        value: fileItem.size
      })
    } catch (err) {
      toast.error(`Failed to download ${fileItem.name}`)
      console.error(err)
    }
  }

  async function handleDownloadAll() {
    if (fileItems.length === 0) {
      toast.error('No files available for download');
      return
    }

    try {
      // Download all files sequentially
      for (const fileItem of fileItems) {
        await handleDownloadFile(fileItem)
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      toast.success(`All ${fileItems.length} files downloaded successfully`);
      
      window?.gtag?.('event', 'download', {
        event_category: 'download',
        event_label: `${fileItems.length} files`,
        value: totalSize
      })
    } catch (err) {
      toast.error('Failed to download some files')
      console.error(err)
    }
  }

  function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase()
    const isDocument = ['pdf', 'doc', 'docx', 'txt'].includes(ext || '')
    return <FileText className={`w-8 h-8 ${isDocument ? 'text-red-500' : 'text-primary'}`} />
  }

  function renderStatusCard(icon: React.ReactNode, title: string, message: string) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
        <Card className="max-w-md p-8 text-center">
          {icon}
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{message}</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br text-muted-foreground from-background via-background/80 to-muted/20">
        <TextShimmer>Downloading files..</TextShimmer>
      </div>
    )
  }

  if (downloadStatus === 'error') {
    return renderStatusCard(
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />,
      'Download Error',
      error.message
    )
  }

  if (fileItems.length === 0) {
    return renderStatusCard(
      <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />,
      'File Not Found',
      'The requested file could not be found.'
    )
  }

  const isMultipleFiles = fileItems.length > 1

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Portal</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">
            Someone shared {isMultipleFiles ? `${fileItems.length} files` : 'a file'} with you
          </h2>
        </div>

        {/* Files Display */}
        <Card className="p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {isMultipleFiles ? (
              <>
                {/* Multiple Files Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <Package className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {fileItems.length} Files
                  </h3>
                  <p className="text-lg text-muted-foreground">Total size: {totalSize}</p>
                </div>

                {/* Download All Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleDownloadAll}
                    disabled={downloadStatus !== 'success'}
                    size="lg"
                    className="w-full h-12 max-w-sm mx-auto text-lg mb-6"
                  >
                    {downloadStatus !== 'success' ? (
                      <>
                        <LoaderCircle className="w-5 h-5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download All Files
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Individual Files List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Individual Files
                  </h4>
                  <div className="space-y-2">
                    {fileItems.map((fileItem, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {getFileIcon(fileItem.name)}
                          <div className="min-w-0 flex-1 text-left">
                            <p className="font-medium truncate text-foreground">
                              {fileItem.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {fileItem.size}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownloadFile(fileItem)}
                          disabled={downloadStatus !== 'success'}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single File Display */}
                <div className="flex items-center justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <FileText className="w-20 h-20 text-primary" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold break-all text-foreground">
                    {fileItems[0].name}
                  </h3>
                  <p className="text-lg text-muted-foreground">{fileItems[0].size}</p>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleDownloadFile(fileItems[0])}
                    disabled={downloadStatus !== 'success'}
                    size="lg"
                    className="w-full h-12 max-w-sm mx-auto text-lg"
                  >
                    {downloadStatus !== 'success' ? (
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
              </>
            )}
          </motion.div>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={() => navigate({ to: '/' })}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        </div>

        {/* Security Footer */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Shared securely with Portal</span>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>🔒 End-to-end encrypted transfer</p>
            <p>🕒 This link will expire automatically</p>
          </div>
        </div>
      </div>
    </div>
  )
} 