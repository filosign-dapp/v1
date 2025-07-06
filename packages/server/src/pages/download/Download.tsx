import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Download, FileText, Shield, LoaderCircle, AlertCircle, Upload, Package, icons } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Badge } from '@/src/lib/components/ui/badge'
import { useParams, useSearch, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useApi } from '@/src/lib/hooks/use-api'
import { handleError, logger } from '@/src/lib/utils'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import { formatFileSize, decompressFile, decryptFile } from '@/src/lib/utils/files'
import Icon from '@/src/lib/components/custom/Icon'
import JSZip from 'jszip'

interface FileItem {
  file: File
  name: string
  size: string
}

export default function DownloadPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingZip, setIsCreatingZip] = useState(false)
  const [fileItems, setFileItems] = useState<FileItem[]>([])
  const [totalSize, setTotalSize] = useState<string>('')

  const { cid } = useParams({ from: '/download/$cid' })
  const { name, key: secretKey } = useSearch({ from: '/download/$cid' })

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
          if (!secretKey) {
            throw new Error('Secret key is missing..');
          }

          const decodedKey = decodeURIComponent(secretKey)
          console.log(decodedKey);
          const decryptedBuffer = await decryptFile(item.buffer, decodedKey);
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

      toast.success(`Downloading ${fileItem.name}`);

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

    if (isCreatingZip) return;

    try {
      setIsCreatingZip(true);
      // Create a new JSZip instance
      const zip = new JSZip();

      // Add all files to the ZIP
      fileItems.forEach(fileItem => {
        zip.file(fileItem.name, fileItem.file);
      });

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      });

      // Create download link for the ZIP file
      const url = URL.createObjectURL(zipBlob);
      const zipFileName = name ? `${name}.zip` : `files-${Date.now()}.zip`;
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: zipFileName
      });

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`ZIP file "${zipFileName}" downloaded successfully`);

      window?.gtag?.('event', 'download', {
        event_category: 'download',
        event_label: `ZIP with ${fileItems.length} files`,
        value: totalSize
      })
    } catch (err) {
      toast.error('Failed to create ZIP file')
      console.error(err)
    } finally {
      setIsCreatingZip(false);
    }
  }

  function getFileIcon(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase()
    const isDocument = ['pdf', 'doc', 'docx', 'txt'].includes(ext || '')
    return <Icon name="File" className={`size-8 ${isDocument ? 'text-neo-cyan-dark' : 'text-zinc-800'}`} />
  }

  function renderStatusCard(iconName: keyof typeof icons, title: string, message: string, isError = false) {
    return (
      <div className="flex items-center justify-center min-h-full bg-neo-bg px-[var(--paddingx)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container px-4 mx-auto max-w-md text-center"
        >
          <Card className={`p-8 text-center ${isError ? 'bg-red-50 border-2 border-red-500' : 'border-2 border-black bg-neo-beige-1'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg`}>
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 ${isError ? 'bg-red-100' : 'bg-neo-yellow-1'} border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center`}>
                  <Icon name={iconName} className={`size-8 ${isError ? 'text-red-600' : 'text-zinc-800'}`} />
                </div>
              </motion.div>
              <h2 className="text-xl font-bold uppercase text-zinc-900">{title}</h2>
              <p className="font-medium text-zinc-600">{message}</p>
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="neo"
                className="bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex gap-2 items-center">
                  <Icon name="Upload" className="w-4 h-4" />
                  <span className="font-medium">Upload New File</span>
                </div>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-neo-bg px-[var(--paddingx)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="space-y-4">
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 mx-auto bg-neo-cyan border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
            >
              <Icon name="Download" className="size-8 text-zinc-900" />
            </motion.div>
            <TextShimmer className="text-lg font-bold">Downloading files..</TextShimmer>
          </div>
        </motion.div>
      </div>
    )
  }

  if (downloadStatus === 'error') {
    return renderStatusCard(
      'CircleAlert',
      'Download Error',
      error?.message || 'Failed to download files',
      true
    )
  }

  if (fileItems.length === 0) {
    return renderStatusCard(
      'CircleAlert',
      'File Not Found',
      'The requested file could not be found.'
    )
  }

  const isMultipleFiles = fileItems.length > 1

  return (
    <div className="flex items-center justify-center min-h-full bg-neo-bg px-[var(--paddingx)]">
      <div className="container px-4 mx-auto space-y-8 max-w-4xl text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <motion.div
            className="inline-block mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-zinc-950 px-3 py-1 font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-neo-green rounded-sm flex items-center gap-1">
              <span>🔒</span> <span className='mt-[0.1rem]'>Secure Download</span>
            </p>
          </motion.div>

          <motion.h1
            className="mb-2 text-3xl font-bold tracking-tight leading-tight uppercase sm:text-4xl md:text-5xl text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Download <span className="text-neo-cyan-dark">File</span>
          </motion.h1>
          <p className="font-medium text-zinc-600">
            Someone shared {isMultipleFiles ? `${fileItems.length} files` : 'a file'} with you
          </p>
        </motion.div>

        {/* Files Display */}
        <Card className="relative overflow-hidden bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-8 space-y-6"
          >
            {isMultipleFiles ? (
              <>
                {/* Multiple Files Header */}
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="w-20 h-20 mx-auto bg-neo-cyan border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
                  >
                    <Icon name="Package" className="size-10 text-zinc-900" />
                  </motion.div>
                  <h3 className="text-2xl font-bold uppercase text-zinc-900">
                    {fileItems.length} Files
                  </h3>
                  <Badge className="rounded-sm bg-neo-beige-2 text-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Total size: {totalSize}
                  </Badge>
                </div>

                {/* Download All Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleDownloadAll}
                    disabled={downloadStatus !== 'success' || isCreatingZip}
                    variant="neo"
                    size="lg"
                    className="w-full h-12 max-w-sm mx-auto text-lg bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {downloadStatus !== 'success' ? (
                      <div className="flex gap-2 items-center">
                        <Icon name="LoaderCircle" className="w-5 h-5 animate-spin" />
                        <span className="font-bold">Downloading...</span>
                      </div>
                    ) : isCreatingZip ? (
                      <div className="flex gap-2 items-center">
                        <Icon name="LoaderCircle" className="w-5 h-5 animate-spin" />
                        <span className="font-bold">Creating ZIP...</span>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Icon name="Package" className="w-5 h-5" />
                        <span className="font-bold">Download as ZIP</span>
                      </div>
                    )}
                  </Button>
                </motion.div>

                {/* Individual Files List */}
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 border-2 border-black bg-neo-yellow-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                    <h4 className="text-sm font-bold tracking-wide uppercase text-zinc-900">
                      Individual Files
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {fileItems.map((fileItem, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border-2 border-black bg-neo-bg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg"
                      >
                        <div className="flex flex-1 gap-3 items-center min-w-0">
                          {getFileIcon(fileItem.name)}
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-bold truncate text-zinc-900">
                              {fileItem.name}
                            </p>
                            <Badge className="mt-1 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                              {fileItem.size}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownloadFile(fileItem)}
                          disabled={downloadStatus !== 'success'}
                          variant="neo"
                          size="sm"
                          className="bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <Icon name="Download" className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single File Display */}
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="w-20 h-20 mx-auto bg-neo-cyan border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
                  >
                    <Icon name="FileText" className="size-10 text-zinc-900" />
                  </motion.div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold uppercase break-all text-zinc-900">
                      {fileItems[0].name}
                    </h3>
                    <Badge className="rounded-sm bg-neo-beige-2 text-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {fileItems[0].size}
                    </Badge>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleDownloadFile(fileItems[0])}
                      disabled={downloadStatus !== 'success'}
                      variant="neo"
                      size="lg"
                      className="w-full h-12 max-w-sm mx-auto text-lg bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {downloadStatus !== 'success' ? (
                        <div className="flex gap-2 items-center">
                          <Icon name="LoaderCircle" className="w-5 h-5 animate-spin" />
                          <span className="font-bold">Downloading...</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Icon name="Download" className="w-5 h-5" />
                          <span className="font-bold">Download File</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </Card>

        {/* Security Footer */}
        <div className="flex justify-center items-center w-full">
          <motion.div
            className="p-3 py-1 border-2 border-black bg-neo-yellow-1/70 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md w-fit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-col gap-2 justify-center items-center text-sm sm:flex-row">
              <Icon name="Zap" className="size-4 text-zinc-700" />
              <span className="font-medium text-center text-zinc-800">
                Files are end-to-end encrypted and shared securely.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}