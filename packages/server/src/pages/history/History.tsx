import { useState } from 'react'
import { History, ExternalLink, Copy, Trash2, Calendar, Trash } from 'lucide-react'
import { Card } from '@/src/lib/components/ui/card'
import { Button } from '@/src/lib/components/ui/button'
import { Badge } from '@/src/lib/components/ui/badge'
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
import { useNavigate } from '@tanstack/react-router'
import Icon from '@/src/lib/components/custom/Icon'
import { truncateAddress } from '@/src/lib/utils'

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useUploadHistory()
  const [copiedId, setCopiedId] = useState<string | null>(null)
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

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
        <div className="w-full max-w-sm space-y-6 text-center sm:max-w-md">
          <div className="space-y-2">
            <History className="w-12 h-12 mx-auto sm:w-16 sm:h-16 text-muted-foreground" />
            <h2 className="text-xl font-bold sm:text-2xl">No Upload History</h2>
            <p className="px-2 text-sm sm:text-base text-muted-foreground">
              Your uploaded files will appear here after you upload them
            </p>
          </div>
          <Button onClick={goToUpload} className="w-full">
            Upload Your First File
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-center min-h-full p-4 sm:p-6">
      <div className="w-full space-y-4 max-w-7xl sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Upload History</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {history.length} upload{history.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={goToUpload} className="w-full sm:w-auto">
              <Icon name='Upload' className='w-4 h-4' />
              Upload More
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex items-center justify-center w-full gap-2 sm:w-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 sm:mx-0">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your upload history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="w-full sm:w-auto">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.map((item: UploadHistoryItem) => (
            <Card key={item.id} className="p-3 sm:p-4">
              <div className="flex gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Main content */}
                <div className="flex items-start flex-1 min-w-0 gap-3 sm:items-center sm:gap-4">
                  <Icon name={item.type === 'directory' ? 'FolderOpen' : 'File'} className='size-6 sm:size-7' />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <h3 className="text-sm font-semibold truncate sm:text-base">{item.name}</h3>
                      <Badge variant={item.type === 'directory' ? 'default' : 'secondary'} className="text-xs w-fit">
                        {item.type === 'directory' ? `${item.fileCount} files` : 'File'}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4 sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.uploadedAt)}
                      </span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2">

                  <span className="flex items-center gap-1 px-2 py-1 font-mono text-xs rounded bg-muted w-fit">
                    <Icon name='Link' className='w-3 h-3' />
                    {truncateAddress(item?.cid ?? '')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(item.downloadUrl, item.id)}
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:inline">{copiedId === item.id ? 'Copied!' : 'Copy Link'}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.downloadUrl, '_blank')}
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:inline">Open</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromHistory(item.id)}
                    className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 