import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Card } from '@/src/lib/components/ui/card'
import { Button } from '@/src/lib/components/ui/button'
import { Badge } from '@/src/lib/components/ui/badge'
import { Input } from '@/src/lib/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/lib/components/ui/select'
import { useUserStore } from '@/src/lib/hooks/use-store'
import { Link } from '@tanstack/react-router'
import Icon from '@/src/lib/components/custom/Icon'
import { createDownloadLink } from '@/src/lib/utils/files'

// Updated data type for shared files based on actual schema
type SharedFile = {
  cid: string
  yourKey: string
  sharedBy: string
  sharedAt: string
  name: string
}

// Mock shared files data using the new schema
const mockSharedFiles: SharedFile[] = [
  // {
  //   cid: 'bafybeieifuosavov2vzil3wbupafniqnl5tmx6wdla5t7w223ljokxxp4u',
  //   yourKey: 'pwI8pjuK+28Rrtg5sro+LVrp5eZ1fwSrnqEJ9xuXWrA==:KgZ7fp9leByrSDjG',
  //   sharedBy: 'ishtails.eth',
  //   sharedAt: '2025-07-06T23:01:00Z',
  //   name: 'folder-1751841671118',
  // },
  
  // https://portal-plgenesis.onrender.com/#/download/bafybeieifuosavov2vzil3wbupafniqnl5tmx6wdla5t7w223ljokxxp4u?name=folder-1751841671118&key=pwI8pjuK%2B28Rrtg5sro%2BLVrp5eZ1fwSrnqEJ9xuXWrA%3D%3AKgZ7fp9leByrSDjG
]

export default function SharedWithYou() {
  const { isRegistered } = useUserStore()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'sharer'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

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

  // Filtered and sorted shared files
  const filteredSharedFiles = useMemo(() => {
    let filtered = mockSharedFiles

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sharedBy.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime()
        case 'oldest':
          return new Date(a.sharedAt).getTime() - new Date(b.sharedAt).getTime()
        case 'sharer':
          return a.sharedBy.localeCompare(b.sharedBy)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredSharedFiles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSharedFiles = filteredSharedFiles.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  // Show upgrade notice for non-premium users
  if (!isRegistered) {
    return (
      <div className="flex justify-center items-center p-4 min-h-full bg-neo-bg sm:p-6">
        <motion.div
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg space-y-6 text-center">
            {/* Crown Icon */}
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-amber-200 border-2 border-amber-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Icon name='Crown' className="w-8 h-8 sm:w-10 sm:h-10 text-amber-800" />
            </motion.div>

            {/* Heading */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl text-zinc-900">
                Premium Feature
              </h2>
              <p className="text-sm font-medium leading-relaxed sm:text-base text-zinc-600">
                File sharing is a premium feature. Upgrade your account to see files that others have shared with you!
              </p>
            </motion.div>

            {/* Primary Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                variant="neo"
                className="w-full bg-amber-200 border-2 border-amber-600 font-bold uppercase tracking-wide text-amber-900 hover:bg-amber-300"
                size="lg"
              >
                <div className="flex gap-2 justify-center items-center">
                  <Icon name="Crown" className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </div>
              </Button>
            </motion.div>

            {/* Features List */}
            <motion.div
              className="pt-2 border-t border-zinc-200 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-xs font-bold text-zinc-700 uppercase">Premium Benefits:</p>
              <div className="space-y-1 text-xs text-zinc-600">
                <p>• Receive files shared by others</p>
                <p>• Share files with specific users</p>
                <p>• Advanced access controls</p>
                <p>• Priority support</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Empty state for premium users with no shared files
  if (mockSharedFiles.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 min-h-full bg-neo-bg sm:p-6">
        <motion.div
          className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 sm:p-8 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg space-y-6 text-center">
            {/* Users Icon */}
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Icon name='Users' className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-800" />
            </motion.div>

            {/* Heading */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight uppercase sm:text-3xl text-zinc-900">
                No Shared Files
              </h2>
              <p className="text-sm font-medium leading-relaxed sm:text-base text-zinc-600">
                No one has shared files with you yet. Files shared with you will appear here.
              </p>
            </motion.div>

            {/* Primary Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/">
                <Button
                  variant="neo"
                  className="w-full bg-neo-cyan border-2 border-black font-bold uppercase tracking-wide"
                  size="lg"
                >
                  <div className="flex gap-2 justify-center items-center">
                    <Icon name="Upload" className="w-5 h-5" />
                    <span>Upload & Share Files</span>
                  </div>
                </Button>
              </Link>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              className="pt-2 border-t border-zinc-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-xs font-medium text-zinc-500">
                All shared files are encrypted and secure
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
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight leading-tight uppercase sm:text-5xl lg:text-6xl text-zinc-900">
              Shared With You
            </h1>
            <p className="font-medium text-zinc-600">
              {filteredSharedFiles.length} file{filteredSharedFiles.length !== 1 ? 's' : ''} shared with you
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center items-center mt-8">
              <Link to="/">
                <Button
                  variant="neo"
                  className="h-10 bg-neo-cyan border-2 border-black font-bold uppercase tracking-wide rounded-sm"
                  size="sm"
                >
                  <Icon name='Upload' className='w-4 h-4' />
                  <span className="ml-1 sm:inline">Upload File</span>
                </Button>
              </Link>

              <Link to="/history">
                <Button
                  variant="neo"
                  className="h-10 bg-neo-beige-2 border-2 border-black font-bold uppercase tracking-wide rounded-sm"
                  size="sm"
                >
                  <Icon name='History' className="w-4 h-4" />
                  <span className="ml-1 sm:inline">My Uploads</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          {mockSharedFiles.length > 0 && (
            <Card className="p-4 sm:p-6 bg-neo-beige-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Icon name='Search' className="absolute left-4 top-1/2 w-4 h-4 transform -translate-y-1/2 text-zinc-700" />
                  <Input
                    placeholder="Search by file name or sharer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-bold text-zinc-900 placeholder:text-zinc-500 focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div className="flex flex-col flex-1 gap-3 sm:flex-row">
                    <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'sharer') => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-36 h-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-bold text-zinc-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
                        <SelectItem value="newest" className="font-bold">Newest First</SelectItem>
                        <SelectItem value="oldest" className="font-bold">Oldest First</SelectItem>
                        <SelectItem value="sharer" className="font-bold">By Sharer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Shared Files List */}
        {filteredSharedFiles.length === 0 && mockSharedFiles.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="text-center py-12 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg">
              <div className="w-20 h-20 mx-auto bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center mb-6">
                <Icon name='Search' className="w-10 h-10 text-zinc-800" />
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight uppercase text-zinc-900">No files found</h3>
              <p className="mb-6 font-bold text-zinc-700">Try adjusting your search or filters</p>
              <Button
                onClick={() => {
                  setSearchQuery('')
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
            {paginatedSharedFiles.map((item: SharedFile, index) => {
              const downloadURL = createDownloadLink(item.cid, 'shared_file', item.yourKey);

              return (
                <motion.div
                  key={item.cid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="p-4 sm:p-6 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg relative">
                    {/* Main content layout */}
                    <div className="flex gap-3 items-start">
                      {/* File icon and info */}
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neo-beige-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name='File' className='w-6 h-6 sm:w-7 sm:h-7 text-zinc-800' />
                        </div>

                        <div className="flex flex-col gap-1 items-start flex-1 min-w-0">
                          {/* Title */}
                          <h3 className="text-lg font-semibold tracking-tight leading-tight break-words sm:text-xl text-zinc-900 pr-2">{item.name}</h3>

                          {/* Shared by info */}
                          <div className="flex gap-2 items-center mb-2">
                            <div className="flex gap-2 items-center">
                              <div className="w-6 h-6 bg-neo-yellow-1 border border-black rounded-full flex items-center justify-center text-xs">
                                {item.sharedBy.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-zinc-700">Shared by {item.sharedBy}</span>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex gap-2 items-center font-medium">
                            <Badge className="h-6 rounded-sm border bg-neo-beige-2 text-zinc-800 border-zinc-500">
                              {formatDate(item.sharedAt)}
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
                          onClick={() => window.open(downloadURL, '_blank')}
                          className="w-8 h-8 p-0 bg-neo-beige-2 border-2 border-black font-bold text-zinc-900"
                        >
                          <Icon name="ExternalLink" className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="neo"
                          size="sm"
                          title={copiedId === item.cid ? 'Copied!' : 'Copy Link'}
                          onClick={() => copyToClipboard(downloadURL, item.cid)}
                          className="w-8 h-8 p-0 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                        >
                          {copiedId === item.cid ? (
                            <Icon name="Check" className="w-4 h-4" />
                          ) : (
                            <Icon name='Copy' className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Mobile action buttons - Bottom on mobile/tablet */}
                    <div className="pt-3 mt-3 border-t-2 border-black lg:hidden">
                      <div className="grid gap-2 grid-cols-2">
                        <Button
                          variant="neo"
                          size="sm"
                          title="Download File"
                          onClick={() => window.open(downloadURL, '_blank')}
                          className="h-10 bg-neo-beige-2 border-2 border-black font-bold text-zinc-900"
                        >
                          <Icon name="ExternalLink" className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="neo"
                          size="sm"
                          title={copiedId === item.cid ? 'Copied!' : 'Copy Link'}
                          onClick={() => copyToClipboard(downloadURL, item.cid)}
                          className="h-10 bg-neo-indigo border-2 border-black text-zinc-900 font-bold"
                        >
                          {copiedId === item.cid ? (
                            <Icon name="Check" className="w-4 h-4" />
                          ) : (
                            <Icon name='Copy' className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {filteredSharedFiles.length > itemsPerPage && (
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
    </div>
  )
}