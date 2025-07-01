import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import Icon from '@/src/lib/components/custom/Icon'
import { cn } from '@/src/lib/utils'
import { useSearch, useNavigate, useParams } from '@tanstack/react-router'
import { createDownloadLink } from '@/src/lib/utils/files'
import { useUserStore } from '@/src/lib/hooks/use-store'
import AccessManagementSheet, { mockExistingAccess } from './AccessManagementSheet'

export default function LinkGenerated() {
  const [copied, setCopied] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
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
    <section className="flex flex-col justify-center items-center overflow-hidden relative px-4 py-16 h-full sm:px-8 bg-neo-bg">
      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 right-16 w-12 h-12 bg-neo-green border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full hidden sm:block"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <motion.div
            className="inline-block mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="bg-neo-green text-zinc-950 px-6 py-3 font-black text-sm sm:text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              ✓ LINK GENERATED
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl font-black tracking-tighter leading-none uppercase sm:text-5xl md:text-7xl text-zinc-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            YOUR FILE IS
            <br />
            <motion.span
              className="text-neo-cyan-dark"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              READY TO SHARE
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Main Content Grid */}
        <div className="gap-8 mb-10">
          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="p-6 sm:p-8 bg-neo-beige-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 rounded-none">
              <div className="space-y-6">
                <h3 className="text-xl font-black tracking-wide uppercase sm:text-2xl text-zinc-900">Share Link</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 border-2 border-black bg-neo-bg">
                    <span className="text-sm font-bold uppercase text-zinc-700">Name:</span>
                    <span className="font-extrabold text-zinc-950 text-right break-all max-w-[60%]">{fileData.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-2 border-black bg-neo-bg">
                    <span className="text-sm font-bold uppercase text-zinc-700">Size:</span>
                    <span className="font-extrabold text-zinc-950">{fileData.size}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={link}
                      readOnly
                      className="font-mono font-medium text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className={cn(
                        "shrink-0 border-2 border-black font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 rounded-none",
                        copied ? "bg-neo-green hover:bg-white" : "bg-neo-yellow-1 hover:bg-white"
                      )}
                    >
                      {copied ? (
                        <div className="flex gap-2 items-center">
                          <Icon name="CircleCheck" className="w-4 h-4 text-zinc-950" />
                          <span className="hidden text-zinc-950 sm:inline">Copied!</span>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <Icon name="Copy" className="w-4 h-4 text-zinc-950" />
                          <span className="hidden text-zinc-950 sm:inline">Copy</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="p-2 border-2 border-black bg-neo-bg">
                    <p className="text-xs font-bold text-zinc-600">
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
          className="flex flex-col gap-6 justify-center items-center mb-10 sm:flex-row"
        >
          <Button
            onClick={handleUploadAnother}
            className="w-full sm:w-auto bg-neo-cyan border-3 border-black text-zinc-950 font-black text-lg p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none"
          >
            <div className="flex gap-3 items-center">
              <Icon name="Upload" className="w-5 h-5" />
              <span>Upload Another File</span>
            </div>
          </Button>

          {/* Premium User: Access Management */}
          {isRegistered && (
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="w-full sm:w-auto bg-neo-purple border-3 border-black text-zinc-950 font-black text-lg p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none"
            >
              <div className="flex gap-3 items-center">
                <Icon name="Shield" className="w-5 h-5" />
                <span>Manage Access ({mockExistingAccess.length})</span>
              </div>
            </Button>
          )}
        </motion.div>
      </div>

      {/* Access Management Sheet */}
      <AccessManagementSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        cid={cid || ''}
        encryptionKey={key || ''}
      />
    </section>
  )
} 