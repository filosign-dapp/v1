import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/src/lib/components/ui/card'
import { TextShimmer } from '@/src/lib/components/ui/text-shimmer'
import { Button } from '@/src/lib/components/ui/button'
import { Switch } from '@/src/lib/components/ui/switch'
import { Input } from '@/src/lib/components/ui/input'
import Icon from '@/src/lib/components/custom/Icon'
import { useNavigate } from '@tanstack/react-router'
import { cn, handleError } from '@/src/lib/utils'
import { useApi } from '@/src/lib/hooks/use-api'
import { useUploadHistory, useUploadSession, useUserStore, type UploadHistoryItem } from '@/src/lib/hooks/use-store'
import { formatFileSize, compressFile, encryptFile, sanitizeFile, basicFileChecks, createDownloadLink } from '@/src/lib/utils/files'
import useContracts from '@/src/lib/hooks/use-contracts'
import { Badge } from '@/src/lib/components/ui/badge'
import { Label } from '@/src/lib/components/ui/label'
import AccessManagementSheet from '../link/AccessManagementSheet'

interface SelectedFile {
  id: string
  file: File
  displayName: string // For the editable name
  size: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  previewUrl?: string // For image/video previews
}

interface UploadResult {
  cid: string
  name: string
  key: string
  size: string
}

// File Preview Component
function FilePreview({ file, previewUrl }: { file: File; previewUrl?: string }) {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (isImage && previewUrl) {
    return (
      <div className="w-16 h-16 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg p-1 flex-shrink-0">
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded-sm border border-black"
        />
      </div>
    )
  }

  if (isVideo && previewUrl) {
    return (
      <div className="w-16 h-16 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg p-1 flex-shrink-0 relative">
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover rounded-sm border border-black"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-sm">
          <Icon name="Play" className="w-4 h-4 text-white" />
        </div>
      </div>
    )
  }

  // Default file icon with neobrutalism styling
  return (
    <div className="w-16 h-16 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon name="File" className="w-8 h-8 text-zinc-800" />
    </div>
  )
}

// Inline Filename Editor Component
function FilenameEditor({
  displayName,
  onChange,
  disabled
}: {
  displayName: string;
  onChange: (newName: string) => void;
  disabled: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(displayName)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== displayName) {
      // Preserve the original extension
      const originalExt = displayName.includes('.') ? '.' + displayName.split('.').pop() : ''
      const newNameWithoutExt = trimmedValue.includes('.') ? trimmedValue.split('.').slice(0, -1).join('.') : trimmedValue
      const finalName = newNameWithoutExt + originalExt
      onChange(finalName)
    }
    setIsEditing(false)
  }, [editValue, displayName, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(displayName)
      setIsEditing(false)
    }
  }, [handleSave, displayName])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      // Select filename without extension
      const nameWithoutExt = editValue.includes('.') ? editValue.split('.').slice(0, -1).join('.') : editValue
      inputRef.current.setSelectionRange(0, nameWithoutExt.length)
    }
  }, [isEditing, editValue])

  return (
    <Input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className="h-8 text-sm font-semibold text-zinc-800 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-white"
    />
  )
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
  const { isRegistered } = useUserStore()
  const [copiedResultId, setCopiedResultId] = useState<string | null>(null)
  const [accessManagementResult, setAccessManagementResult] = useState<UploadResult | null>(null)

  useEffect(() => {
    if (lastUploadResults.length > 0 && uploadResults.length === 0) {
      setUploadResults(lastUploadResults)
    }
  }, [lastUploadResults, uploadResults.length])

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedResultId(id)
      setTimeout(() => setCopiedResultId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Generate preview for file
  const generatePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }

    if (file.type.startsWith('video/')) {
      return new Promise((resolve) => {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true
        video.playsInline = true

        video.onloadedmetadata = () => {
          video.currentTime = Math.min(5, video.duration / 2) // Seek to 5s or middle
        }

        video.onseeked = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 160
          canvas.height = 160
          const ctx = canvas.getContext('2d')

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL())
          } else {
            resolve(undefined)
          }

          URL.revokeObjectURL(video.src)
        }

        video.onerror = () => {
          URL.revokeObjectURL(video.src)
          resolve(undefined)
        }

        video.src = URL.createObjectURL(file)
      })
    }

    return undefined
  }, [])

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

  async function addFiles(files: File[]) {
    const newFiles: SelectedFile[] = []

    for (const file of files) {
      // Check if file is already selected (by name and size to handle duplicates)
      const isDuplicate = selectedFiles.some(selected =>
        selected.file.name === file.name &&
        selected.file.size === file.size &&
        selected.file.lastModified === file.lastModified
      )

      if (!isDuplicate) {
        const previewUrl = await generatePreview(file)

        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          displayName: file.name,
          size: formatFileSize(file.size),
          status: 'pending',
          progress: 0,
          previewUrl
        })
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }

  function removeFile(id: string) {
    const fileToRemove = selectedFiles.find(f => f.id === id)
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl)
    }
    setSelectedFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileStatus = (id: string, status: SelectedFile['status'], progress = 0) => {
    setSelectedFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status, progress } : f
    ))
  }

  const updateFileName = (id: string, newDisplayName: string) => {
    setSelectedFiles(prev => prev.map(f =>
      f.id === id ? { ...f, displayName: newDisplayName } : f
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
          // Create a new File with the updated name
          const originalFile = selectedFile.file
          const renamedFile = new File([originalFile], selectedFile.displayName, {
            type: originalFile.type,
            lastModified: originalFile.lastModified
          })

          basicFileChecks(renamedFile);
          const sanitizedFile = sanitizeFile(renamedFile);
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
          fileNames: selectedFiles.map(f => f.displayName)
        }
        addToHistory(historyItem)

        setSelectedFiles([])
      } else {
        const uploadPromises = selectedFiles.map(async (selectedFile) => {
          const { file, id, displayName } = selectedFile

          try {
            updateFileStatus(id, 'uploading', 30)

            // Create a new File with the updated name
            const renamedFile = new File([file], displayName, {
              type: file.type,
              lastModified: file.lastModified
            })

            basicFileChecks(renamedFile);
            const sanitizedFile = sanitizeFile(renamedFile);

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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl)
        }
      })
    }
  }, [])

  const hasFiles = selectedFiles.length > 0
  const canSubmit = hasFiles && !isUploading && !isUploadingDirectory
  const isProcessing = isUploading || isUploadingDirectory

  return (
    <div className="py-8 flex items-center justify-center min-h-full bg-neo-bg px-[var(--paddingx)]">
      {/* Single subtle decorative element */}
      <motion.div
        className="hidden md:flex absolute top-36 right-12 lg:top-48 lg:right-56 size-14 bg-neo-bg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg items-center z-0 justify-center"
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

      <div className="container mx-auto max-w-4xl space-y-8 text-center px-4 z-10">
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
        <Card>
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

              <div className="space-y-3">
                {selectedFiles.map((selectedFile) => (
                  <div
                    key={selectedFile.id}
                    className={cn(
                      "p-4 border-2 border-black transition-colors bg-neo-bg rounded-md",
                      selectedFile.status === 'pending' && "bg-neo-bg",
                      selectedFile.status === 'uploading' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      selectedFile.status === 'success' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                      selectedFile.status === 'error' && "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <FilePreview file={selectedFile.file} previewUrl={selectedFile.previewUrl} />
                        <div className="flex flex-col gap-2 min-w-0">
                          <div className="w-full">
                            <FilenameEditor
                              displayName={selectedFile.displayName}
                              onChange={(newName) => updateFileName(selectedFile.id, newName)}
                              disabled={selectedFile.status === 'uploading'}
                            />
                          </div>
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
                        {selectedFile.status === 'success' && <Icon name="CircleCheck" className="w-5 h-5 text-neo-cyan-dark" />}
                        {selectedFile.status === 'uploading' && <Icon name='LoaderCircle' className="w-5 h-5 animate-spin" />}
                        {selectedFile.status === 'error' && <Icon name="CircleX" className="w-5 h-5 text-red-600" />}
                        {selectedFile.status !== 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(selectedFile.id)}
                            className="hover:bg-red-100 h-8 w-8 p-0"
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

              <div className="space-y-3">
                {uploadResults.map((result, index) => {
                  const downloadUrl = createDownloadLink(result.cid, result.name, result.key)
                  const resultId = `${result.cid}-${index}`
                  
                  return (
                    <div
                      key={index}
                      className="p-4 bg-neo-bg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md"
                    >
                      {/* Main content layout */}
                      <div className="flex gap-3 items-start">
                        {/* File info */}
                        <div className="flex gap-3 items-start flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neo-green border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon name="CircleCheck" className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-900" />
                          </div>

                          <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
                            <h3 className="text-lg font-semibold tracking-tight leading-tight break-words sm:text-xl text-zinc-900 pr-2">{result.name}</h3>
                            <div className="flex gap-2 items-center font-medium">
                              <Badge className="h-6 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                                {result.size}
                              </Badge>
                              <Badge className="h-6 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                                Just uploaded
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons - Right side on desktop */}
                        <div className="hidden lg:flex gap-2 items-start flex-shrink-0 ml-4">
                          <Button
                            variant="neo"
                            size="sm"
                            title="Download File"
                            onClick={() => window.open(downloadUrl, '_blank')}
                            className="w-8 h-8 p-0 bg-neo-beige-2 border-2 border-black font-bold text-zinc-900"
                          >
                            <Icon name="ExternalLink" className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="neo"
                            size="sm"
                            title={copiedResultId === resultId ? 'Copied!' : 'Copy Link'}
                            onClick={() => copyToClipboard(downloadUrl, resultId)}
                            className="w-8 h-8 p-0 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                          >
                            {copiedResultId === resultId ? (
                              <Icon name="Check" className="w-4 h-4" />
                            ) : (
                              <Icon name='Copy' className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="neo"
                            size="sm"
                            title="View Details"
                            onClick={() => navigate({
                              to: '/link/$cid',
                              params: { cid: result.cid },
                              search: {
                                name: result.name,
                                key: result.key,
                                size: result.size,
                              }
                            })}
                            className="w-8 h-8 p-0 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                          >
                            <Icon name='File' className="w-4 h-4" />
                          </Button>

                          {/* Premium Access - Inline on desktop */}
                          {isRegistered && (
                            <Button
                              variant="neo"
                              size="sm"
                              onClick={() => setAccessManagementResult(result)}
                              className="w-8 h-8 p-0 bg-amber-200 border-2 border-amber-600 hover:bg-amber-300"
                              title="Manage Access (Premium)"
                            >
                              <Icon name="Crown" className="w-4 h-4 text-amber-800" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Mobile action buttons - Bottom on mobile/tablet */}
                      <div className="pt-3 mt-3 border-t-2 border-black lg:hidden">
                        <div className={`grid gap-2 ${isRegistered ? 'grid-cols-4' : 'grid-cols-3'}`}>
                          <Button
                            variant="neo"
                            size="sm"
                            title="Download File"
                            onClick={() => window.open(downloadUrl, '_blank')}
                            className="h-10 bg-neo-beige-2 border-2 border-black font-bold text-zinc-900"
                          >
                            <Icon name="ExternalLink" className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="neo"
                            size="sm"
                            title={copiedResultId === resultId ? 'Copied!' : 'Copy Link'}
                            onClick={() => copyToClipboard(downloadUrl, resultId)}
                            className="h-10 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                          >
                            {copiedResultId === resultId ? (
                              <Icon name="Check" className="w-4 h-4" />
                            ) : (
                              <Icon name='Copy' className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="neo"
                            size="sm"
                            title="View Details"
                            onClick={() => navigate({
                              to: '/link/$cid',
                              params: { cid: result.cid },
                              search: {
                                name: result.name,
                                key: result.key,
                                size: result.size,
                              }
                            })}
                            className="h-10 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                          >
                            <Icon name='File' className="w-4 h-4" />
                          </Button>

                          {/* Premium Access - Mobile */}
                          {isRegistered && (
                            <Button
                              variant="neo"
                              size="sm"
                              onClick={() => setAccessManagementResult(result)}
                              className="h-10 bg-amber-200 border-2 border-amber-600 hover:bg-amber-300 text-amber-800"
                              title="Manage Access (Premium)"
                            >
                              <Icon name="Crown" className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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

      {/* Access Management Sheet */}
      {accessManagementResult && (
        <AccessManagementSheet
          isOpen={!!accessManagementResult}
          onOpenChange={(open) => !open && setAccessManagementResult(null)}
          cid={accessManagementResult.cid}
          encryptionKey={accessManagementResult.key}
          fileName={accessManagementResult.name}
          fileSize={accessManagementResult.size}
        />
      )}
    </div>
  )
} 