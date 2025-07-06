import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/src/lib/components/ui/button'
import { Card } from '@/src/lib/components/ui/card'
import { Input } from '@/src/lib/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/src/lib/components/ui/sheet'
import { DateTimePicker } from '@/src/lib/components/app/date-time-picker'
import Icon from '@/src/lib/components/custom/Icon'
import { cn } from '@/src/lib/utils'
import { getSecondsFromNow, createDateFromInput } from '@/src/lib/utils/date'
import useContracts from '@/src/lib/hooks/use-contracts'
import { toast } from 'sonner'

// Mock data for existing access - replace with real data later
const mockExistingAccess: { address: string, grantedAt: string }[] = [
  // {
  //   address: '0x5D56b71abE6cA1Dc208Ed85926178f9758fa879c',
  //   grantedAt: '2025-07-06',
  // },
  // {
  //   address: '0xAA1bfB4D4eCDbc78A6f929D829fded3710D070D0',
  //   grantedAt: '2025-07-06',
  // }
]

interface AccessManagementSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cid: string
  encryptionKey: string
  fileName?: string
  fileSize?: string
}

export default function AccessManagementSheet({
  isOpen,
  onOpenChange,
  cid,
  encryptionKey,
  fileName,
  fileSize,
}: AccessManagementSheetProps) {
  const [recipients, setRecipients] = useState<string[]>([''])
  const [isPublishing, setIsPublishing] = useState(false)
  const [cost, setCost] = useState<string>('')
  const [expiryDateTime, setExpiryDateTime] = useState<string>('')
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

      // Parse cost and expiry values
      const costValue = cost.trim() !== '' ? parseFloat(cost) : undefined
      const expiryValue = expiryDateTime.trim() !== '' ? getSecondsFromNow(createDateFromInput(expiryDateTime)) : undefined

      // Validate cost if provided
      if (costValue !== undefined && (isNaN(costValue) || costValue < 0)) {
        toast.error("Please enter a valid cost (positive number)")
        return
      }

      // Validate expiry if provided
      if (expiryDateTime.trim() !== '' && expiryValue !== undefined && expiryValue <= 0) {
        toast.error("Please select a future date and time for expiry")
        return
      }

      const costInWei = costValue ? BigInt(costValue * 10 ** 18) : undefined;
      const expiration = expiryValue ? expiryValue : undefined;

      const options = {
        cid,
        msg: encryptionKey,
        recipients: validRecipients as `0x${string}`[],
        safe: true,
        cost: costInWei,
        expiration: expiration
      }

      console.log(options);

      await mutateContractsAsync(async (contracts) => {
        const tx = await contracts.publishEncryptedKeys(options);

        console.log('Transaction:', tx);
        toast.success(`Request submitted!`)
      });

      // Reset recipients after successful submission
      setRecipients(['']);
      setCost('');
      setExpiryDateTime('');
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
      <SheetContent className="overflow-y-auto p-0 w-full sm:max-w-md bg-neo-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          <SheetHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mx-auto w-16 h-16 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center bg-neo-indigo"
            >
              <Icon name="Users" className="size-8 text-zinc-950" />
            </motion.div>

            <div>
              <SheetTitle className="text-2xl font-bold text-zinc-900">Manage File Access</SheetTitle>
              <SheetDescription className="mt-2 text-base text-zinc-600 font-medium">
                Control who has direct access to your file through their premium accounts.
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* File Information Card */}
          <Card className="p-1 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg mt-6">
            <div className="flex justify-between items-center p-3 border-2 border-black bg-neo-bg rounded-md">
              <span className="text-sm font-bold text-zinc-700">File:</span>
              <span className="font-medium text-zinc-950 text-right break-all max-w-[60%]">
                {fileName || 'Unknown file'}
              </span>
            </div>
          </Card>

          {/* Add New Recipients Section */}
          <Card className="p-6 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg mt-6">
            <div className="space-y-4">
              <h4 className="text-lg font-bold tracking-wide uppercase text-zinc-900">Grant New Access</h4>

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
                      className="font-mono text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 rounded-md"
                    />
                    {recipients.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeRecipientField(index)}
                        className="shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-lg bg-neo-pink transition-all duration-150"
                      >
                        <Icon name="X" className="w-4 h-4 text-zinc-950" />
                      </Button>
                    )}
                  </motion.div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="neo"
                    size="sm"
                    onClick={addRecipientField}
                    className="bg-neo-beige-2 rounded-lg"
                  >
                    <Icon name="Plus" className="w-4 h-4 text-zinc-950" />
                    <span className="font-medium text-zinc-950">Add Recipient</span>
                  </Button>
                </div>

                {/* Pro Member Options */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 mt-4 p-4 bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg"
                >
                  <div className="flex flex-col gap-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                        Cost (USDFC)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="font-mono text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 rounded-md"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                        Expires On
                      </label>
                      <DateTimePicker
                        value={expiryDateTime}
                        onChange={(value) => setExpiryDateTime(value)}
                        placeholder="Select expiry date & time"
                        className="w-full"
                      />
                    </div>
                  </div>
                </motion.div>

                <Button
                  onClick={() => handlePublishEncryptedKeys()}
                  disabled={isPublishing}
                  variant={"neo"}
                  className="w-full bg-neo-purple border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-lg"
                  size={"lg"}
                >
                  {isPublishing ? (
                    <div className="flex gap-2 items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent" />
                      Granting Access...
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Icon name="Users" className="size-5" />
                      Grant File Access
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Existing Access List */}
          <Card className="p-6 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg mt-6">
            <div className="space-y-4">
              <div className="flex gap-2 items-center justify-between">
                <h4 className="text-lg font-bold tracking-wide uppercase text-zinc-900">Current Access</h4>
                <div className="bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-bold text-zinc-950">{mockExistingAccess.length}</span>
                </div>
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
                        "flex justify-between items-center p-4 transition-all duration-150",
                        "bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-lg"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <span className="text-xs bg-neo-green border-2 border-black text-zinc-950 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase tracking-wide rounded-sm">
                            Active
                          </span>
                        </div>
                        <p className="font-mono text-xs font-bold text-zinc-700">
                          {formatAddress(access.address)}
                        </p>
                        <p className="text-xs font-medium text-zinc-600">
                          Granted on {access.grantedAt}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] rounded-lg bg-neo-pink text-zinc-950 font-medium hover:bg-white transition-all duration-150"
                      >
                        Revoke
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center p-8 text-zinc-600 bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                    <Icon name="Users" className="mx-auto mb-3 w-12 h-12 opacity-50 text-zinc-500" />
                    <p className="text-sm font-medium">No users have been granted access yet</p>
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