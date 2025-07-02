import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/src/lib/components/ui/card'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import { Button } from '@/src/lib/components/ui/button'
import { Switch } from '@/src/lib/components/ui/switch'
import { Progress } from '@/src/lib/components/ui/progress'
import Icon from '@/src/lib/components/custom/Icon'
import { useNavigate } from '@tanstack/react-router'
import { cn, handleError } from '@/src/lib/utils'
import { useApi } from '@/src/lib/hooks/use-api'
import { useUploadHistory, useUploadSession, type UploadHistoryItem } from '@/src/lib/hooks/use-store'
import { formatFileSize, compressFile, encryptFile, sanitizeFile, basicFileChecks, createDownloadLink } from '@/src/lib/utils/files'
import useContracts from '@/src/lib/hooks/use-contracts'
import { Badge } from '@/src/lib/components/ui/badge'
import { Label } from '@/src/lib/components/ui/label'

interface SelectedFile {
  id: string
  file: File
  size: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
}

interface UploadResult {
  cid: string
  name: string
  key: string
  size: string
}

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isError, setIsError] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [isDirectoryMode, setIsDirectoryMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { uploadFile, uploadDirectory } = useApi()
  const { mutateAsync: uploadFileMutation, isPending: isUploading } = uploadFile
  const { mutateAsync: uploadDirectoryMutation, isPending: isUploadingDirectory } = uploadDirectory
  const { addToHistory } = useUploadHistory()
  const { lastUploadResults, setLastUploadResults, clearLastUploadResults } = useUploadSession()
  const [copiedLink, setCopiedLink] = useState("");

  useEffect(() => {
    if (lastUploadResults.length > 0 && uploadResults.length === 0) {
      setUploadResults(lastUploadResults)
    }
  }, [lastUploadResults, uploadResults.length])

  // Clear session when user starts a new upload
  const clearSession = () => {
    clearLastUploadResults()
    setUploadResults([])
  }

  function handleDragEvents(e: React.DragEvent, isDragging?: boolean) {
    e.preventDefault()
    if (isDragging !== undefined) setIsDragOver(isDragging)
    if (e.type === 'drop') {
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsError(false)
    const files = Array.from(e.target.files || [])
    addFiles(files)
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  function addFiles(files: File[]) {
    const newFiles: SelectedFile[] = []

    files.forEach(file => {
      // Check if file is already selected (by name and size to handle duplicates)
      const isDuplicate = selectedFiles.some(selected =>
        selected.file.name === file.name &&
        selected.file.size === file.size &&
        selected.file.lastModified === file.lastModified
      )

      if (!isDuplicate) {
        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          size: formatFileSize(file.size),
          status: 'pending',
          progress: 0
        })
      }
    })

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  function removeFile(id: string) {
    setSelectedFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileStatus = (id: string, status: SelectedFile['status'], progress = 0) => {
    setSelectedFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status, progress } : f
    ))
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0) return

    try {
      setIsError(false)

      if (isDirectoryMode && selectedFiles.length > 1) {
        const directoryName = `folder-${Date.now()}`
        const processedFiles = []

        // Mark all files as uploading
        selectedFiles.forEach(f => updateFileStatus(f.id, 'uploading', 25))

        let sharedSecretKey: string | undefined = undefined

        for (const selectedFile of selectedFiles) {
          const { file } = selectedFile
          basicFileChecks(file);
          const sanitizedFile = sanitizeFile(file);
          updateFileStatus(selectedFile.id, 'uploading', 50)

          const compressedBuffer = await compressFile(sanitizedFile);
          const { encryptedBuffer, secretKey } = await encryptFile(compressedBuffer, sharedSecretKey);

          if (!sharedSecretKey) {
            sharedSecretKey = secretKey;
          }

          updateFileStatus(selectedFile.id, 'uploading', 75)

          processedFiles.push({
            buffer: encryptedBuffer,
            name: sanitizedFile.name,
            type: sanitizedFile.type
          })
        }

        if (!sharedSecretKey) {
          throw new Error('No shared secret key found')
        }

        const result = await uploadDirectoryMutation({
          encryptedFiles: processedFiles,
        });

        // Mark all as success
        selectedFiles.forEach(f => updateFileStatus(f.id, 'success', 100))

        const totalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0)
        const uploadResult = {
          cid: result.cid,
          name: directoryName,
          key: sharedSecretKey,
          size: formatFileSize(totalSize)
        }

        setUploadResults([uploadResult])
        setLastUploadResults([uploadResult])

        // Save to history
        const historyItem: UploadHistoryItem = {
          id: `${result.cid}-${Date.now()}`,
          cid: result.cid,
          name: directoryName,
          key: sharedSecretKey,
          size: formatFileSize(totalSize),
          type: 'directory',
          fileCount: selectedFiles.length,
          uploadedAt: new Date().toISOString(),
          downloadUrl: createDownloadLink(result.cid, directoryName, sharedSecretKey),
          fileNames: selectedFiles.map(f => f.file.name)
        }
        addToHistory(historyItem)

        setSelectedFiles([])
      } else {
        const uploadPromises = selectedFiles.map(async (selectedFile) => {
          const { file, id } = selectedFile

          try {
            updateFileStatus(id, 'uploading', 30)
            basicFileChecks(file);
            const sanitizedFile = sanitizeFile(file);

            updateFileStatus(id, 'uploading', 50)
            const compressedBuffer = await compressFile(sanitizedFile);
            const { encryptedBuffer, secretKey } = await encryptFile(compressedBuffer);

            updateFileStatus(id, 'uploading', 80)
            const result = await uploadFileMutation({
              encryptedBuffer,
              metadata: { name: sanitizedFile.name, type: sanitizedFile.type }
            })

            updateFileStatus(id, 'success', 100)
            return {
              cid: result.cid,
              name: sanitizedFile.name,
              key: secretKey,
              size: formatFileSize(sanitizedFile.size)
            }
          } catch (error) {
            updateFileStatus(id, 'error', 0)
            throw error
          }
        })

        const results = await Promise.all(uploadPromises)
        setUploadResults(results)
        setLastUploadResults(results)

        // Save individual files to history
        const historyItems: UploadHistoryItem[] = results.map(result => ({
          id: `${result.cid}-${Date.now()}-${Math.random()}`,
          cid: result.cid,
          name: result.name,
          key: result.key,
          size: result.size,
          type: 'file' as const,
          uploadedAt: new Date().toISOString(),
          downloadUrl: createDownloadLink(result.cid, result.name, result.key)
        }))
        addToHistory(historyItems)

        // Navigate logic for individual files
        if (results.length === 1) {
          const result = results[0]
          navigate({
            to: '/link/$cid',
            params: { cid: result.cid },
            search: {
              name: result.name,
              key: result.key,
              size: result.size,
            }
          })
        } else {
          setSelectedFiles([])
        }
      }
    } catch (error) {
      setIsError(true)
      handleError(error)
    }
  }

  const hasFiles = selectedFiles.length > 0
  const canSubmit = hasFiles && !isUploading && !isUploadingDirectory
  const isProcessing = isUploading || isUploadingDirectory

  return (
    <div className="flex items-center justify-center min-h-full bg-neo-bg px-[var(--paddingx)]">
      {/* Single subtle decorative element */}
      <motion.div
        className="absolute top-36 right-24 lg:top-48 lg:right-56 size-14 bg-neo-green border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg hidden sm:flex items-center justify-center"
        animate={{
          y: [0, -8, 0],
          rotate: [0, 3, -3, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Icon name="CircleFadingPlus" className="size-6 text-zinc-900" />
      </motion.div>

      <div className="container mx-auto max-w-4xl space-y-8 text-center px-4">
        {/* Subtle Header */}
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
              <span>🔒</span> <span className='mt-[0.1rem]'>Secure Upload</span>
            </p>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl text-zinc-900 mb-2 uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Upload Your <span className="text-neo-cyan-dark">Files</span>
          </motion.h1>
          <p className="text-zinc-600 font-medium">Secure, encrypted file sharing</p>
        </motion.div>

        {/* Upload Area */}
        <Card className="relative overflow-hidden bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
          <motion.div
            className={cn(
              "border-2 border-dashed transition-all duration-200 p-12 cursor-pointer rounded-lg",
              isDragOver && "border-neo-cyan-dark bg-neo-cyan/10 scale-[1.01]",
              !isDragOver && "border-zinc-400 hover:border-neo-cyan-dark hover:bg-neo-beige-2/50",
              isProcessing && "pointer-events-none opacity-70",
              isError && "border-red-500 bg-red-50"
            )}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={(e) => handleDragEvents(e)}
            onClick={() => fileInputRef.current?.click()}
            whileTap={{ scale: 0.99 }}
          >
            {isProcessing ? (
              <div className="space-y-4">
                {isDirectoryMode ? <Icon name="FolderUp" className="w-16 h-16 mx-auto text-zinc-700" /> : <Icon name="CloudUpload" className="w-16 h-16 mx-auto text-zinc-700" />}
                <h3 className="text-lg font-bold text-zinc-900">
                  {isDirectoryMode ? 'Creating directory...' : `Uploading ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}...`}
                </h3>
                <TextShimmer duration={3}>
                  Securing your files with end-to-end encryption...
                </TextShimmer>
              </div>
            ) : (
              <div className="space-y-4">
                <motion.div
                  animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon name="CircleFadingArrowUp" className="w-16 h-16 mx-auto text-zinc-800" />
                </motion.div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-zinc-900">Drag & Drop Your Files</h3>
                  <div className="inline-block px-3 py-1 border-2 border-black bg-neo-bg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-semibold text-neo-beige-1-dark text-sm">
                      click to browse
                    </p>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="*/*"
              multiple
            />
          </motion.div>
        </Card>

        {/* Upload Mode Toggle */}
        {hasFiles && (
          <Card className="p-4 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label htmlFor="directory-mode" className="text-sm font-bold text-zinc-900">
                  Directory Mode
                </Label>
                <Switch
                  id="directory-mode"
                  checked={isDirectoryMode}
                  onCheckedChange={setIsDirectoryMode}
                  disabled={isProcessing}
                />
              </div>
              <Badge className='rounded-sm bg-neo-beige-1 text-zinc-800 border border-zinc-500'>
                {isDirectoryMode ? 'Upload as directory' : 'Upload files individually'}
              </Badge>
            </div>
          </Card>
        )}

        {/* Selected Files */}
        {hasFiles && (
          <Card className="p-6 bg-neo-beige-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900">
                  Selected Files ({selectedFiles.length})
                </h3>
                <Button
                  variant="neo"
                  className="bg-neo-beige-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="Plus" className="w-4 h-4" />
                    <span className="font-medium">Add More</span>
                  </div>
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((selectedFile) => (
                  <div
                    key={selectedFile.id}
                    className={cn(
                      "p-3 border-2 border-black transition-colors bg-neo-bg rounded-md",
                      selectedFile.status === 'pending' && "bg-neo-bg",
                      selectedFile.status === 'uploading' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      selectedFile.status === 'success' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      selectedFile.status === 'error' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon name="File" className=" text-zinc-800 size-10" />
                        <div className="flex flex-col gap-1 items-start">
                          <p className="font-semibold text-zinc-800 truncate">{selectedFile.file.name}</p>
                          <div className="flex gap-2">
                            <Badge className='rounded-sm bg-neo-beige-2 text-zinc-800 border border-zinc-500'>
                              {selectedFile.size}
                            </Badge>
                            <Badge className='rounded-sm bg-neo-beige-2 text-zinc-800 border border-zinc-500'>
                              {selectedFile.file.type || 'Unknown type'}
                            </Badge>
                          </div>
                          
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedFile.status === 'success' && <Icon name="CircleCheck" className="w-4 h-4 text-neo-cyan-dark" />}
                        {selectedFile.status === 'uploading' && <Icon name='LoaderCircle' className="w-4 h-4 animate-spin" />}
                        {selectedFile.status !== 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(selectedFile.id)}
                            className="hover:bg-red-100"
                          >
                            <Icon name="X" className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                variant="neo"
                className="w-full bg-neo-beige-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                size="lg"
              >
                <div className="flex items-center gap-2 justify-center">
                  {isDirectoryMode ? <Icon name="FolderUp" className="w-5 h-5" /> : <Icon name="CloudUpload" className="w-5 h-5" />}
                  <span className="font-semibold">
                    {isDirectoryMode
                      ? `Create Directory (${selectedFiles.length} files)`
                      : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                    }
                  </span>
                </div>
              </Button>
            </div>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <Card className="p-6 bg-neo-beige-1 border-2 border-neo-cyan-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neo-green border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md flex items-center justify-center">
                    <Icon name="Check" className="w-4 h-4 text-zinc-900" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    Upload Complete
                  </h3>
                </div>
                <Button
                  variant="neo"
                  className="bg-neo-yellow-1 rounded-none"
                  size="sm"
                  onClick={clearSession}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="Plus" className="w-4 h-4" />
                    <span className="font-medium">Start New Upload</span>
                  </div>
                </Button>
              </div>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neo-bg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="CircleCheck" className="w-5 h-5 text-neo-cyan-dark" />
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-zinc-900">{result.name}</p>
                        <Badge className='rounded-sm bg-white text-zinc-800 border border-zinc-500'>
                          {result.size}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="neo"
                        className="bg-neo-beige-2"
                        size="sm"
                        onClick={() => navigate({
                          to: '/link/$cid',
                          params: { cid: result.cid },
                          search: {
                            name: result.name,
                            key: result.key,
                            size: result.size,
                          }
                        })}
                      >
                        <div className="flex items-center gap-1">
                          <Icon name="File" className="size-3" />
                          <span className="font-medium text-sm">View Upload</span>
                        </div>
                      </Button>

                      <Button
                        variant="neo"
                        className="bg-neo-beige-2"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(createDownloadLink(result.cid, result.name, result.key))
                            setCopiedLink(createDownloadLink(result.cid, result.name, result.key))
                          } catch (err) {
                            console.error('Failed to copy link:', err)
                          }
                        }}>
                        {copiedLink === createDownloadLink(result.cid, result.name, result.key) ? (
                          <div className="flex items-center gap-1">
                            <Icon name="CircleCheck" className="size-3" />
                            <span className="font-medium text-sm">Copied!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Icon name="Copy" className="size-3" />
                            <span className="font-medium text-sm">Copy Link</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <div className="flex items-center justify-center w-full">
          <motion.div
            className="p-3 py-1 border-2 border-black bg-neo-yellow-1/70 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md w-fit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
              <Icon name="Zap" className="size-4 text-zinc-700" />
              <span className="font-medium text-zinc-800 text-center">
                Files are end-to-end encrypted. We can't see what's inside.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 