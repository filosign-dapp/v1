import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle, Copy, Upload } from 'lucide-react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import { useSearch, useNavigate, useParams } from '@tanstack/react-router'
import { createDownloadLink } from '@/src/lib/utils/files'
import { useUserStore } from '@/src/lib/hooks/use-store'

export default function LinkGenerated() {
  const [copied, setCopied] = useState(false)
  const { isRegistered } = useUserStore();
  const navigate = useNavigate()

  const { cid } = useParams({
    from: '/link/$cid',
  })

  // Get file data from URL search parameters
  const {
    name,
    size,
    key
  } = useSearch({
    from: '/link/$cid',
  });

  const link = createDownloadLink(cid || '', name || '', key || '')

  const fileData = {
    name: name || 'Unknown file',
    size: size || '0 B',
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleUploadAnother = () => {
    navigate({ to: '/' })
  }

  return (
    <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-background via-background/80 to-muted/20">   
      <div className="w-full max-w-2xl">
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
                  value={link}
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
          <div className="flex justify-center">
            <Button
              onClick={handleUploadAnother}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Another File
            </Button>
          </div>

          {/* Security Note */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>🔒 Your file is encrypted and stored securely</p>
            <p>🕒 Link expires automatically for your protection</p>
          </div>
        </div>
      </div>
    </div>
  )
} 