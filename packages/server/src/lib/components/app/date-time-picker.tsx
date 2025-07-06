import * as React from "react"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/src/lib/components/ui/button"
import { Input } from "@/src/lib/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/lib/components/ui/popover"
import { cn } from "@/src/lib/utils"
import { formatForDateTimeInput, getMinDateTime, getDefaultExpiryDateTime, formatDateTime } from "@/src/lib/utils/date"

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDateTime?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className,
  disabled,
  minDateTime,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")

  React.useEffect(() => {
    setInputValue(value || "")
  }, [value])

  const handleSelect = (newValue: string) => {
    setInputValue(newValue)
    onChange?.(newValue)
    setOpen(false)
  }

  const displayValue = inputValue 
    ? formatDateTime(inputValue, "MMM D, YYYY [at] h:mm A")
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 rounded-md",
            !inputValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
          <Clock className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-neo-bg" 
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-900">Select Date & Time</label>
            <Input
              type="datetime-local"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              min={minDateTime || getMinDateTime()}
              className="font-mono text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 rounded-md"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md"
            >
              Cancel
            </Button>
            <Button
              variant="neo"
              size="sm"
              onClick={() => handleSelect(inputValue)}
              disabled={!inputValue}
              className="flex-1 bg-neo-purple border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md"
            >
              Select
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Quick Options</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(getDefaultExpiryDateTime())}
                className="text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md bg-neo-beige-2"
              >
                1 Hour
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(formatForDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)))}
                className="text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md bg-neo-beige-2"
              >
                1 Day
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(formatForDateTimeInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)))}
                className="text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md bg-neo-beige-2"
              >
                1 Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelect(formatForDateTimeInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)))}
                className="text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md bg-neo-beige-2"
              >
                1 Month
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 