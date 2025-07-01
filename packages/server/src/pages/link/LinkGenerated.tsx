import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import Icon from '@/src/lib/components/custom/Icon'
import { cn } from '@/src/lib/utils'
import { useSearch, useParams, Link } from '@tanstack/react-router'
import { createDownloadLink } from '@/src/lib/utils/files'
import { useUserStore } from '@/src/lib/hooks/use-store'
import AccessManagementSheet, { mockExistingAccess } from './AccessManagementSheet'

export default function LinkGenerated() {
  const [copied, setCopied] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { isRegistered } = useUserStore();

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
        <Icon name="Sticker" className="size-6 text-zinc-900" />
      </motion.div>

      <div className="container mx-auto max-w-4xl space-y-8 text-center px-4">
        {/* Success Header */}
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
            <span className="text-zinc-950 px-3 py-1 font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-neo-green rounded-sm flex items-center gap-2">
              <p>✓</p> <p>Link Generated</p>
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl md:text-5xl text-zinc-900 mb-2 uppercase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Your File Is
            <br />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Ready to <span
                className="text-neo-cyan-dark">Share</span>
            </motion.span>
          </motion.h1>
          <p className="text-zinc-600 font-medium">Secure link generated successfully</p>
        </motion.div>

        {/* Main Content */}
        <div className="mb-8">
          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6 sm:p-8 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-zinc-900">Share Link</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border-2 border-black bg-neo-bg rounded-md">
                    <span className="text-sm font-bold text-zinc-700">Name:</span>
                    <span className="font-medium text-zinc-950 text-right break-all max-w-[60%]">{fileData.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-2 border-black bg-neo-bg rounded-md">
                    <span className="text-sm font-bold text-zinc-700">Size:</span>
                    <span className="font-medium text-zinc-950">{fileData.size}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={link}
                      readOnly
                      className="font-mono font-medium text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant={"neo"}
                      className={cn(
                        "border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                        copied ? "bg-neo-green hover:bg-neo-green/80" : "bg-neo-yellow-1 hover:bg-neo-yellow-1/80"
                      )}
                    >
                      {copied ? (
                        <div className="flex gap-2 items-center">
                          <Icon name="CircleCheck" className="w-4 h-4 text-zinc-950" />
                          <span className="hidden text-zinc-950 sm:inline font-medium">Copied!</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Icon name="Copy" className="w-4 h-4 text-zinc-950" />
                          <span className="hidden text-zinc-950 sm:inline font-medium">Copy</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="p-3 border-2 border-black bg-neo-bg/50 rounded-md">
                    <p className="text-xs font-medium text-zinc-600">
                      🕒 Expires in 7 days • 🔒 Only accessible with this link
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-4 justify-center items-center mb-8 sm:flex-row"
        >
          <Link to="/upload">
            <Button
              variant={"neo"}
              className="bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              size={"lg"}
            >
              <div className="flex gap-3 items-center">
                <Icon name="Upload" className="w-5 h-5" />
                <span className="font-medium">Upload Another File</span>
              </div>
            </Button>
          </Link>

          {/* Premium User: Access Management */}
          {isRegistered && (
            <Button
              onClick={() => setIsSheetOpen(true)}
              variant={"neo"}
              className="bg-neo-purple border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              size={"lg"}
            >
              <div className="flex gap-3 items-center">
                <Icon name="Shield" className="w-5 h-5" />
                <span className="font-medium">Manage Access [{mockExistingAccess.length}]</span>
              </div>
            </Button>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="p-3 border-2 border-black bg-neo-yellow-1/60 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <Icon name="Shield" className="size-4 text-zinc-700" />
            <span className="font-medium text-zinc-800 text-center">
              Your link is secure and encrypted. Share with confidence.
            </span>
          </div>
        </motion.div>
      </div>

      {/* Access Management Sheet */}
      <AccessManagementSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        cid={cid || ''}
        encryptionKey={key || ''}
      />
    </div>
  )
} 