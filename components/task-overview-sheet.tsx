"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  IconCalendar,
  IconClock,
  IconFileDescription,
  IconAlertCircle,
  IconX,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { type Task } from "@/components/tasks-table"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TaskOverviewSheetProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateTask?: (id: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask?: (id: string) => Promise<void>
}

export function TaskOverviewSheet({ 
  task, 
  open, 
  onOpenChange,
  onUpdateTask,
  onDeleteTask 
}: TaskOverviewSheetProps) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  if (!task) return null

  const handleMarkComplete = async () => {
    if (!onUpdateTask) return
    
    setIsUpdating(true)
    try {
      const newStatus = task.status === "done" ? "todo" : "done"
      await onUpdateTask(task.id, { status: newStatus })
      toast.success(`Task marked as ${newStatus === "done" ? "complete" : "incomplete"}`)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!onDeleteTask) return
    
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }
    
    setIsUpdating(true)
    try {
      await onDeleteTask(task.id)
      toast.success("Task deleted successfully")
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0 flex flex-col">
        {/* Header with gradient background */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-b">
          <SheetHeader className="px-6 pt-6 pb-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-2xl font-bold leading-tight pr-8">
                  {task.title}
                </SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 -mt-1 -mr-2 h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <IconX className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize font-medium",
                  task.status === "done" && "bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700",
                  task.status === "in progress" && "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700",
                  task.status === "todo" && "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-700",
                  task.status === "backlog" && "bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-700",
                  task.status === "canceled" && "bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700"
                )}
              >
                {task.status}
              </Badge>
              <Badge 
                variant="secondary" 
                className={cn(
                  "font-medium",
                  task.priority === "high" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                  task.priority === "medium" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                  task.priority === "low" && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                )}
              >
                {task.priority} Priority
              </Badge>
            </div>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <IconFileDescription className="h-4 w-4 text-primary" />
                </div>
                <span>Description</span>
              </div>
              <div className="pl-9">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Date Information */}
          {(task.date || task.deadline || task.reminder) && (
            <>
              {task.description && <Separator />}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconCalendar className="h-4 w-4 text-primary" />
                  </div>
                  <span>Timeline</span>
                </div>
                
                <div className="pl-9 space-y-3">
                  {task.date && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</p>
                        <p className="text-sm font-medium mt-0.5">
                          {format(parseISO(task.date), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}

                  {task.deadline && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-50 dark:bg-red-950">
                        <IconAlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-medium mt-0.5 text-red-600 dark:text-red-400">
                          {format(parseISO(task.deadline), "EEEE, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}

                  {task.reminder && (
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950">
                        <IconClock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reminder</p>
                        <p className="text-sm font-medium mt-0.5 text-blue-600 dark:text-blue-400">
                          {format(parseISO(task.reminder), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Task Metadata */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-primary/10">
                <IconFileDescription className="h-4 w-4 text-primary" />
              </div>
              <span>Details</span>
            </div>
            <div className="pl-9 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground">Task ID</span>
                <span className="text-xs font-mono text-foreground">{task.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t bg-background px-6 py-4">
          <div className="flex items-center gap-2">
            {onUpdateTask && (
              <Button
                onClick={handleMarkComplete}
                variant={task.status === "done" ? "outline" : "default"}
                className="flex-1"
                disabled={isUpdating}
              >
                <IconCheck className="mr-2 h-4 w-4" />
                {task.status === "done" ? "Mark Incomplete" : "Mark Complete"}
              </Button>
            )}
            {onDeleteTask && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="icon"
                disabled={isUpdating}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
