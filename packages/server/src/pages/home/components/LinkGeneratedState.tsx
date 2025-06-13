import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle, Copy, Upload, ExternalLink } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import type { FileData } from '../Portal'

interface LinkGeneratedStateProps {
  fileData: FileData
  onUploadAnother: () => void
  onViewDownload: () => void
}

export default function LinkGeneratedState({ fileData, onUploadAnother, onViewDownload }: LinkGeneratedStateProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileData.link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="space-y-8 text-center">
      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CheckCircle className="w-20 h-20 text-green-500" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Your secure link is ready!
          </h2>
          <p className="text-lg text-muted-foreground">
            Share this link to send your file securely
          </p>
        </div>
      </motion.div>

      {/* File Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">File:</span>
            <span className="font-medium">{fileData.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">{fileData.size}</span>
          </div>
        </div>
      </Card>

      {/* Shareable Link */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-left">Shareable Link</h3>
          
          <div className="flex gap-2">
            <Input
              value={fileData.link}
              readOnly
              className="font-mono text-sm bg-muted/50"
            />
            <Button
              onClick={handleCopyLink}
              className="shrink-0"
              variant={copied ? "secondary" : "default"}
            >
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

          <p className="text-xs text-left text-muted-foreground">
            This link will expire in 7 days. Only people with this link can access your file.
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          onClick={onUploadAnother}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Another File
        </Button>
        
        <Button
          onClick={onViewDownload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Preview Download Page
        </Button>
      </div>

      {/* Security Note */}
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>🔒 Your file is encrypted and stored securely</p>
        <p>🕒 Link expires automatically for your protection</p>
      </div>
    </div>
  )
} 