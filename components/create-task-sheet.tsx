"use client"

import * as React from "react"
import { format } from "date-fns"
import { IconCalendar, IconClock } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { type Task } from "@/components/tasks-table"
import { toast } from "sonner"

const statuses = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "Todo" },
  { value: "in progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "canceled", label: "Canceled" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

interface CreateTaskSheetProps {
  children: React.ReactNode
  onTaskCreate?: (task: Omit<Task, "id">) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateTaskSheet({ children, onTaskCreate, open: controlledOpen, onOpenChange }: CreateTaskSheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [status, setStatus] = React.useState<Task["status"]>("todo")
  const [priority, setPriority] = React.useState<Task["priority"]>("medium")
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [deadline, setDeadline] = React.useState<Date | undefined>(undefined)
  const [reminder, setReminder] = React.useState<Date | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (onTaskCreate) {
        await onTaskCreate({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          date: date ? format(date, "yyyy-MM-dd") : undefined,
          deadline: deadline ? format(deadline, "yyyy-MM-dd") : undefined,
          reminder: reminder ? reminder.toISOString() : undefined,
        })
      }
      
      // Show success notification
      toast.success("Task added successfully", {
        description: `"${title.trim()}" has been added to your tasks.`,
        duration: 3000,
      })
      
      // Reset form
      setTitle("")
      setDescription("")
      setStatus("todo")
      setPriority("medium")
      setDate(undefined)
      setDeadline(undefined)
      setReminder(undefined)
      setOpen(false)
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create task", {
        description: error instanceof Error ? error.message : "Please try again.",
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="text-left space-y-2">
            <DialogTitle className="text-2xl font-semibold">Add New Task</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new task by filling in the details below. All fields except title are optional.
            </DialogDescription>
          </DialogHeader>
          <div className={`space-y-6 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Task Title - Required */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Task Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Complete project documentation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Task Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add a detailed description of the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Status and Priority - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold">
                  Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Task["status"])}>
                  <SelectTrigger id="status" className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold">
                  Priority
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Task["priority"])}
                >
                  <SelectTrigger id="priority" className="h-10">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Date and Deadline - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "MMM d, yyyy") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-sm font-semibold">
                  Deadline
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "MMM d, yyyy") : <span>Select deadline</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-2">
              <Label htmlFor="reminder" className="text-sm font-semibold">
                Reminder
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="reminder"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !reminder && "text-muted-foreground"
                    )}
                  >
                    <IconClock className="mr-2 h-4 w-4" />
                    {reminder ? format(reminder, "MMM d, yyyy 'at' h:mm a") : <span>Set reminder</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <Calendar
                      mode="single"
                      selected={reminder}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date)
                          if (reminder) {
                            newDate.setHours(reminder.getHours(), reminder.getMinutes())
                          } else {
                            newDate.setHours(9, 0) // Default to 9:00 AM
                          }
                          setReminder(newDate)
                        } else {
                          setReminder(undefined)
                        }
                      }}
                      initialFocus
                    />
                    {reminder && (
                      <div className="mt-3 pt-3 border-t">
                        <Label htmlFor="reminder-time" className="text-sm font-medium mb-2 block">
                          Time
                        </Label>
                        <Input
                          id="reminder-time"
                          type="time"
                          value={reminder ? format(reminder, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":")
                            if (reminder && hours && minutes) {
                              const newReminder = new Date(reminder)
                              newReminder.setHours(parseInt(hours), parseInt(minutes))
                              setReminder(newReminder)
                            } else if (hours && minutes) {
                              const newReminder = new Date()
                              newReminder.setHours(parseInt(hours), parseInt(minutes))
                              setReminder(newReminder)
                            }
                          }}
                          className="w-full h-9"
                        />
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="sm:min-w-[100px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim()}
              className="sm:min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
