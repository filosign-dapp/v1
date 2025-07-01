import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/src/lib/components/ui/sheet'
import Icon from '@/src/lib/components/custom/Icon'
import { cn } from '@/src/lib/utils'
import useContracts from '@/src/lib/hooks/use-contracts'
import { toast } from 'sonner'

// Mock data for existing access - replace with real data later
const mockExistingAccess = [
  {
    address: '0x5D56b71abE6cA1Dc208Ed85926178f9758fa879c',
    grantedAt: '2024-01-15',
    nickname: 'Alice'
  },
  {
    address: '0x742d35Cc6C4563C7B8Dd2E9a4b2d71cA0b23F4a1',
    grantedAt: '2024-01-14',
    nickname: 'Bob'
  }
]

interface AccessManagementSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cid: string
  encryptionKey: string
}

export default function AccessManagementSheet({ 
  isOpen, 
  onOpenChange, 
  cid, 
  encryptionKey 
}: AccessManagementSheetProps) {
  const [recipients, setRecipients] = useState<string[]>([''])
  const [isPublishing, setIsPublishing] = useState(false)
  const { mutateAsync: mutateContractsAsync } = useContracts().mutate;

  const addRecipientField = () => {
    setRecipients([...recipients, ''])
  }

  const removeRecipientField = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index)
      setRecipients(newRecipients)
    }
  }

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = value
    setRecipients(newRecipients)
  }

  const handlePublishEncryptedKeys = async () => {
    try {
      setIsPublishing(true)
      
      // Filter out empty addresses
      const validRecipients = recipients.filter(addr => addr.trim() !== '')
      
      if (validRecipients.length === 0) {
        toast.error("Please enter at least one recipient address")
        return
      }

      // Validate Ethereum addresses (basic validation)
      const invalidAddresses = validRecipients.filter(addr => 
        !addr.match(/^0x[a-fA-F0-9]{40}$/)
      )
      
      if (invalidAddresses.length > 0) {
        toast.error("Please enter valid Ethereum addresses")
        return
      }

      await mutateContractsAsync(async (contracts) => {
        const tx = await contracts.publishEncryptedKeys({
          cid: cid,
          msg: encryptionKey,
          recipients: validRecipients as `0x${string}`[],
          safe: false,
        });

        console.log('Transaction:', tx);
        toast.success(`Successfully shared file access with ${validRecipients.length} recipient(s)!`)
      });
      
      // Reset recipients after successful submission
      setRecipients([''])
      onOpenChange(false)
    } catch (error) {
      console.error('Error publishing encrypted keys:', error)
      toast.error("Failed to share file access. Please try again.")
    } finally {
      setIsPublishing(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full bg-neo-beige-2 overflow-y-auto p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <SheetHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto w-16 h-16 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center bg-neo-indigo"
            >
              <Icon name="Users" className="size-8 text-zinc-950" />
            </motion.div>
            
            <div>
              <SheetTitle className="text-2xl font-bold">Manage File Access</SheetTitle>
              <SheetDescription className="text-base mt-2">
                Control who has direct access to your file through their premium accounts.
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Add New Recipients Section */}
          <Card className="p-6 bg-neo-beige-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-neo-purple border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center">
                  <Icon name="Plus" className="size-4 text-zinc-950" />
                </div>
                <h4 className="font-black text-lg uppercase tracking-wide text-zinc-900">Grant New Access</h4>
              </div>
              
              <div className="space-y-3">
                {recipients.map((recipient, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="0x... (Ethereum address)"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      className="font-mono text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                    />
                    {recipients.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeRecipientField(index)}
                        className="shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-none bg-neo-pink transition-all duration-150"
                      >
                        <Icon name="X" className="w-4 h-4 text-zinc-950" />
                      </Button>
                    )}
                  </motion.div>
                ))}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRecipientField}
                    className="flex items-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-none bg-neo-cyan transition-all duration-150"
                  >
                    <Icon name="Plus" className="w-4 h-4 text-zinc-950" />
                    <span className="font-bold text-zinc-950">Add Recipient</span>
                  </Button>
                </div>

                <Button
                  onClick={handlePublishEncryptedKeys}
                  disabled={isPublishing}
                  className="w-full bg-neo-yellow-1 border-4 border-black text-zinc-950 font-black py-6 text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none"
                >
                  {isPublishing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Granting Access...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icon name="Users" className="size-5" />
                      Grant File Access
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Existing Access List */}
          <Card className="p-6 bg-neo-beige-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-neo-purple border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center">
                  <Icon name="Users" className="size-4 text-zinc-950" />
                </div>
                <h4 className="font-black text-lg uppercase tracking-wide text-zinc-900">Current Access</h4>
                <span className="text-xs bg-neo-cyan border-2 border-black text-zinc-950 px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase tracking-wide">
                  {mockExistingAccess.length} users
                </span>
              </div>

              <div className="space-y-3">
                {mockExistingAccess.length > 0 ? (
                  mockExistingAccess.map((access, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-4 transition-all duration-150",
                        "bg-neo-bg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-zinc-950">{access.nickname}</span>
                          <span className="text-xs bg-neo-green border border-black text-zinc-950 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase tracking-wide">
                            Active
                          </span>
                        </div>
                        <p className="font-mono text-xs text-zinc-700 font-bold">
                          {formatAddress(access.address)}
                        </p>
                        <p className="text-xs text-zinc-600 font-bold">
                          Granted on {access.grantedAt}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-none bg-neo-pink text-zinc-950 font-bold hover:bg-white transition-all duration-150"
                      >
                        Revoke
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-8 text-zinc-600 bg-neo-bg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Icon name="Users" className="w-12 h-12 mx-auto mb-3 opacity-50 text-zinc-500" />
                    <p className="text-sm font-bold">No users have been granted access yet</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}

export { mockExistingAccess } 