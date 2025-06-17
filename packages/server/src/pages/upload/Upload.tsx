import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { CloudUpload, Shield, X, Plus, Upload, CheckCircle, FolderUp, Copy } from 'lucide-react'
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
import { useAccount, useBalance } from 'wagmi'
import { formatEther } from 'viem'

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
  const [copied, setCopied] = useState(false)

  const { address } = useAccount();
  const { data: balance } = useBalance({ address })

  // Initialize upload results from session store on component mount
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

      if (isDirectoryMode) {
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
    <div className="flex items-center justify-center min-h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">
      <div className="container mx-auto max-w-4xl space-y-8 text-center px-4">
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
              isProcessing && "pointer-events-none opacity-50",
              isError && "border-destructive bg-destructive/5"
            )}
            onDragOver={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={(e) => handleDragEvents(e)}
            onClick={() => fileInputRef.current?.click()}
            whileTap={{ scale: 0.99 }}
          >
            {isProcessing ? (
              <div className="space-y-2">
                {isDirectoryMode ? <FolderUp className="w-16 h-16 mx-auto text-muted-foreground" /> : <Icon name="CloudUpload" className="w-16 h-16 mx-auto text-muted-foreground" />}
                <h3 className="text-lg font-semibold">
                  {isDirectoryMode ? 'Creating directory...' : `Uploading ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}...`}
                </h3>
                <TextShimmer duration={3} className="w-full">
                  Securing your files with end-to-end encryption..
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
                  <h3 className="text-xl font-semibold">Drag & Drop Your Files</h3>
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
              multiple
            />
          </motion.div>
        </Card>

        {/* Upload Mode Toggle */}
        {hasFiles && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label htmlFor="directory-mode" className="text-sm font-medium">
                  Directory Mode
                </label>
                <Switch
                  id="directory-mode"
                  checked={isDirectoryMode}
                  onCheckedChange={setIsDirectoryMode}
                  disabled={isProcessing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isDirectoryMode ? 'Upload as single encrypted directory' : 'Upload files individually'}
              </p>
            </div>
          </Card>
        )}

        {/* Selected Files */}
        {hasFiles && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Selected Files ({selectedFiles.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                  disabled={isProcessing}
                >
                  <Plus className="w-4 h-4" />
                  Add More Files
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((selectedFile) => (
                  <div
                    key={selectedFile.id}
                    className={cn(
                      "p-3 rounded-lg transition-colors",
                      selectedFile.status === 'pending' && "bg-muted/30",
                      selectedFile.status === 'uploading' && "bg-blue-50 dark:bg-blue-900/20",
                      selectedFile.status === 'success' && "bg-green-50 dark:bg-green-900/20",
                      selectedFile.status === 'error' && "bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icon name="File" className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{selectedFile.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedFile.size} • {selectedFile.file.type || 'Unknown type'}
                          </p>
                          {selectedFile.status === 'uploading' && (
                            <div className="mt-4">
                              <Progress value={selectedFile.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedFile.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {selectedFile.status === 'uploading' && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                        {selectedFile.status !== 'uploading' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(selectedFile.id)}
                            className="flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
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
                className="w-full flex items-center gap-2"
                size="lg"
              >
                {isDirectoryMode ? <FolderUp className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                {isDirectoryMode
                  ? `Create Directory (${selectedFiles.length} files)`
                  : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-green-600">Upload Complete!</h3>
                <Button
                  variant="outline"
                  onClick={clearSession}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start New Upload
                </Button>
              </div>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
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
                      View Link
                    </Button>

                    <Button onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createDownloadLink(result.cid, result.name, result.key))
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      } catch (err) {
                        console.error('Failed to copy link:', err)
                      }
                    }}>
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {address && (
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Your address: {address}</span>
            <span>Balance: {balance?.value ? formatEther(balance.value) : '0'} ETH</span>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Files are end-to-end encrypted. We never see your data.</span>
        </div>
      </div>
    </div>
  )
} 