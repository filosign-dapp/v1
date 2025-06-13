import { useState } from 'react'
import { motion } from 'motion/react'
import { Download, FileText, Shield, ArrowLeft, LoaderCircle } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import type { FileData } from '../Portal'

interface DownloadStateProps {
  fileData: FileData
  onBackToUpload: () => void
}

export default function DownloadState({ fileData, onBackToUpload }: DownloadStateProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false)
      // In a real app, this would trigger the actual file download
      console.log('Downloading:', fileData.name)
    }, 2000)
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    // You could expand this with more specific icons
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

  return (
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
              {getFileIcon(fileData.name)}
            </motion.div>
          </div>

          {/* File Details */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-foreground break-all">
              {fileData.name}
            </h3>
            <p className="text-lg text-muted-foreground">
              {fileData.size}
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

      {/* Back to Upload Demo */}
      <div className="pt-4">
        <Button 
          variant="ghost" 
          onClick={onBackToUpload}
          className="text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </Button>
      </div>
    </div>
  )
} 