import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/src/lib/components/ui/card'
import { Button } from '@/src/lib/components/ui/button'
import { Badge } from '@/src/lib/components/ui/badge'
import { Input } from '@/src/lib/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/lib/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/lib/components/ui/alert-dialog'
import { useUploadHistory, type UploadHistoryItem } from '@/src/lib/hooks/use-store'
import { useUserStore } from '@/src/lib/hooks/use-store'
import { useNavigate } from '@tanstack/react-router'
import Icon from '@/src/lib/components/custom/Icon'
import AccessManagementSheet from '../link/AccessManagementSheet'

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useUploadHistory()
  const { isRegistered } = useUserStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [accessManagementItem, setAccessManagementItem] = useState<UploadHistoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'file' | 'directory'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const navigate = useNavigate()

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const goToUpload = () => {
    navigate({ to: '/' })
  }

  // Filtered and sorted history
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          // Convert size strings to bytes for comparison
          const aBytes = parseInt(a.size.replace(/[^\d]/g, ''))
          const bBytes = parseInt(b.size.replace(/[^\d]/g, ''))
          return bBytes - aBytes
        default:
          return 0
      }
    })

    return filtered
  }, [history, searchQuery, typeFilter, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter, sortBy])

  if (history.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 min-h-full bg-neo-bg sm:p-6">
        <motion.div
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg space-y-6 text-center">
            {/* Icon */}
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Icon name='History' className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-800" />
            </motion.div>

            {/* Heading */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl text-zinc-900">
                No Upload History
              </h2>
              <p className="text-sm font-medium leading-relaxed sm:text-base text-zinc-600">
                Your uploaded files will appear here after you upload them. Start by uploading your first file!
              </p>
            </motion.div>

            {/* Primary Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={goToUpload}
                variant="neo"
                className="w-full bg-neo-cyan border-2 border-black font-bold uppercase tracking-wide"
                size="lg"
              >
                <div className="flex gap-2 justify-center items-center">
                  <Icon name="Upload" className="w-5 h-5" />
                  <span>Upload Your First File</span>
                </div>
              </Button>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              className="pt-2 border-t border-zinc-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-xs font-medium text-zinc-500">
                Files are encrypted and securely stored
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-start p-4 min-h-full bg-neo-bg sm:p-6">
      <motion.div
        className="space-y-6 w-full max-w-7xl py-6 sm:space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Simple Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight leading-tight uppercase sm:text-5xl lg:text-6xl text-zinc-900">
              Upload History
            </h1>
            <p className="mt-2 font-medium text-zinc-600">
              {filteredHistory.length} upload{filteredHistory.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Search and Filters */}
          {history.length > 0 && (
            <Card className="p-4 sm:p-6 bg-neo-beige-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Icon name='Search' className="absolute left-4 top-1/2 w-4 h-4 transform -translate-y-1/2 text-zinc-700" />
                  <Input
                    placeholder="Search uploads by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-bold text-zinc-900 placeholder:text-zinc-500 focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div className="flex flex-col flex-1 gap-3 sm:flex-row">
                    <Select value={typeFilter} onValueChange={(value: 'all' | 'file' | 'directory') => setTypeFilter(value)}>
                      <SelectTrigger className="w-full sm:w-36 h-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-bold text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <SelectItem value="all" className="font-bold">All Types</SelectItem>
                        <SelectItem value="file" className="font-bold">Files Only</SelectItem>
                        <SelectItem value="directory" className="font-bold">Folders Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'name' | 'size') => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-36 h-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-bold text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <SelectItem value="newest" className="font-bold">Newest First</SelectItem>
                        <SelectItem value="oldest" className="font-bold">Oldest First</SelectItem>
                        <SelectItem value="name" className="font-bold">Name A-Z</SelectItem>
                        <SelectItem value="size" className="font-bold">Largest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Simplified Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="neo"
                      onClick={goToUpload}
                      className="h-10 bg-neo-cyan border-2 border-black font-bold uppercase tracking-wide rounded-sm"
                      size="sm"
                    >
                      <Icon name='Upload' className='w-4 h-4' />
                      <span className="hidden ml-2 sm:inline">Upload</span>
                    </Button>

                    {history.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="neo"
                            className="h-10 bg-red-200 border-2 border-red-600 hover:bg-red-100 text-red-900 font-bold uppercase tracking-wide rounded-sm"
                            size="sm"
                          >
                            <Icon name='Trash' className="w-4 h-4" />
                            <span className="hidden ml-2 sm:inline">Clear</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 sm:mx-0 bg-neo-beige-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold tracking-tight uppercase text-zinc-900">Clear All History?</AlertDialogTitle>
                            <AlertDialogDescription className="font-bold text-zinc-700">
                              This action cannot be undone. This will permanently delete all {history.length} upload{history.length !== 1 ? 's' : ''} from your history.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
                            <AlertDialogCancel className="w-full sm:w-auto bg-neo-beige-2 border-2 border-black font-bold">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={clearHistory}
                              className="w-full sm:w-auto bg-red-500 border-2 border-red-700 font-bold hover:bg-red-600 text-white uppercase"
                            >
                              Clear All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* History List */}
        {filteredHistory.length === 0 && history.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="text-center py-12 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="w-20 h-20 mx-auto bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center mb-6">
                <Icon name='Search' className="w-10 h-10 text-zinc-800" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight uppercase text-zinc-900">No uploads found</h3>
              <p className="mb-6 font-bold text-zinc-700">Try adjusting your search or filters</p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('all')
                  setSortBy('newest')
                }}
                variant="neo"
                className="bg-neo-yellow-1 border-2 border-black font-bold uppercase tracking-wide"
              >
                Clear Filters
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {paginatedHistory.map((item: UploadHistoryItem, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4 sm:p-6 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg relative">
                  <div className="space-y-4">
                    {/* Premium Access - Top Right */}
                    {isRegistered && (
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="neo"
                          size="sm"
                          onClick={() => setAccessManagementItem(item)}
                          className="w-8 h-8 p-0 bg-amber-200 border-2 border-amber-600 hover:bg-amber-300"
                          title="Manage Access (Premium)"
                        >
                          <Icon name="Crown" className="w-3 h-3 text-amber-800" />
                        </Button>
                      </div>
                    )}

                    {/* Main content */}
                    <div className="flex gap-3 items-start pr-10 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={item.type === 'directory' ? 'FolderOpen' : 'File'} className='w-6 h-6 sm:w-7 sm:h-7 text-zinc-800' />
                      </div>

                      <div className="flex flex-col gap-1 items-start">
                        {/* Title */}
                        <h3 className="text-lg font-semibold tracking-tight leading-tight break-words sm:text-xl text-zinc-900">{item.name}</h3>

                        {/* Simplified Metadata */}
                        <div className="flex gap-2 items-center font-medium">
                          <Badge className="h-6 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                            {item.size}
                          </Badge>
                          <Badge className="h-6 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                            {formatDate(item.uploadedAt)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Simplified Actions */}
                    <div className="pt-4 space-y-3 border-t-2 border-black">
                      {/* Primary Action */}
                      <Button
                        variant="neo"
                        onClick={() => navigate({
                          to: '/link/$cid',
                          params: { cid: item.cid },
                          search: {
                            name: item.name,
                            key: item.key,
                            size: item.size,
                          }
                        })}
                        className="w-full h-12 bg-neo-beige-2 border-2 border-black font-bold text-zinc-900 tracking-wide"
                      >
                        <div className="flex gap-2 justify-center items-center">
                          <Icon name="Eye" className="w-5 h-5" />
                          <span>View Upload</span>
                        </div>
                      </Button>

                      {/* Secondary Actions - Simplified */}
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant="neo"
                          size="sm"
                          title={copiedId === item.id ? 'Copied!' : 'Copy Link'}
                          onClick={() => copyToClipboard(item.downloadUrl, item.id)}
                          className="h-10 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                        >
                          <div className="flex gap-2 justify-center items-center">
                            {copiedId === item.id ? (
                              <Icon name="Check" className="w-4 h-4" />
                            ) : (
                              <Icon name='Copy' className="w-4 h-4" />
                            )}
                            <span className="hidden lg:inline">
                              {copiedId === item.id ? 'Copied!' : 'Copy'}
                            </span>
                          </div>
                        </Button>

                        <Button
                          variant="neo"
                          size="sm"
                          title="Open in New Tab"
                          onClick={() => window.open(item.downloadUrl, '_blank')}
                          className="h-10 bg-neo-yellow-1 border-2 border-black text-zinc-900 font-bold"
                        >
                          <div className="flex gap-2 justify-center items-center">
                            <Icon name='ExternalLink' className="w-4 h-4" />
                            <span className="hidden lg:inline">Open</span>
                          </div>
                        </Button>

                        <Button
                          variant="neo"
                          size="sm"
                          title="Delete from History"
                          onClick={() => removeFromHistory(item.id)}
                          className="h-10 bg-red-300 border-2 border-red-600 hover:bg-red-400 text-red-900 font-bold"
                        >
                          <div className="flex gap-2 justify-center items-center">
                            <Icon name='Trash' className="w-4 h-4" />
                            <span className="hidden lg:inline">Delete</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Simplified Pagination */}
        {filteredHistory.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4 bg-neo-beige-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="flex gap-4 justify-center items-center">
                <Button
                  variant="neo"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-10 bg-neo-beige-2 border-2 border-black disabled:opacity-50 font-bold"
                >
                  <Icon name='ChevronLeft' className="w-4 h-4" />
                </Button>

                <span className="text-sm font-bold text-zinc-900">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="neo"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 bg-neo-beige-1 border-2 border-black disabled:opacity-50 font-bold"
                >
                  <Icon name='ChevronRight' className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* Access Management Sheet */}
      {accessManagementItem && (
        <AccessManagementSheet
          isOpen={!!accessManagementItem}
          onOpenChange={(open) => !open && setAccessManagementItem(null)}
          cid={accessManagementItem.cid}
          encryptionKey={accessManagementItem.key}
          fileName={accessManagementItem.name}
          fileSize={accessManagementItem.size}
        />
      )}
    </div>
  )
} 