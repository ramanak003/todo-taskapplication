"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTasks } from "@/hooks/use-tasks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { CreateTaskSheet } from "@/components/create-task-sheet"
import { TaskOverviewSheet } from "@/components/task-overview-sheet"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconCalendar,
  IconClock,
  IconPlus,
  IconDotsVertical,
  IconTrash,
} from "@tabler/icons-react"
import { format, isAfter, parseISO, startOfDay } from "date-fns"
import { type Task } from "@/components/tasks-table"
import { toast } from "sonner"

// TaskCard component for individual task items
function TaskCard({
  task,
  onTaskClick,
  onUpdateTask,
  onDeleteTask,
}: {
  task: Task
  onTaskClick: (task: Task) => void
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask: (id: string) => Promise<void>
}) {
  const [isUpdating, setIsUpdating] = React.useState(false)

  const handleStatusChange = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUpdating(true)
    try {
      const newStatus = task.status === "done" ? "todo" : "done"
      await onUpdateTask(task.id, { status: newStatus })
      toast.success(`Task marked as ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update task")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (priority: Task["priority"]) => {
    setIsUpdating(true)
    try {
      await onUpdateTask(task.id, { priority })
      toast.success(`Priority updated to ${priority}`)
    } catch (error) {
      toast.error("Failed to update priority")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusUpdate = async (status: Task["status"]) => {
    setIsUpdating(true)
    try {
      await onUpdateTask(task.id, { status })
      toast.success(`Status updated to ${status}`)
    } catch (error) {
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }
    
    setIsUpdating(true)
    try {
      await onDeleteTask(task.id)
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`group p-3 rounded-md border hover:border-primary/50 hover:bg-accent/50 transition-all ${
        isUpdating ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={handleStatusChange}
          className="mt-0.5"
          onClick={(e) => e.stopPropagation()}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onTaskClick(task)}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4
              className={`font-semibold text-sm flex-1 group-hover:text-primary transition-colors line-clamp-1 ${
                task.status === "done" ? "line-through text-muted-foreground" : ""
              }`}
            >
              {task.title}
            </h4>
            <div className="flex gap-1 shrink-0">
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${
                  task.priority === "high"
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-700"
                    : task.priority === "medium"
                    ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700"
                    : "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700"
                }`}
              >
                {task.priority}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {task.status}
              </Badge>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            {task.deadline && (
              <div className="flex items-center gap-1">
                <IconClock className="h-3 w-3" />
                <span>Due: {format(parseISO(task.deadline), "MMM d")}</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
              <IconDotsVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleStatusUpdate("todo")}>
                  Todo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("in progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("done")}>
                  Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("backlog")}>
                  Backlog
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("canceled")}>
                  Canceled
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change Priority</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handlePriorityChange("low")}>
                  Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange("medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange("high")}>
                  High
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function Page() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [isOverviewOpen, setIsOverviewOpen] = React.useState(false)

  const today = startOfDay(new Date())

  // Filter tasks with upcoming deadlines or dates
  const upcomingTasks = tasks.filter((task) => {
    if (task.deadline) {
      try {
        const deadline = parseISO(task.deadline)
        return isAfter(deadline, today) && task.status !== "done" && task.status !== "canceled"
      } catch {
        return false
      }
    }
    if (task.date) {
      try {
        const taskDate = parseISO(task.date)
        return isAfter(taskDate, today) && task.status !== "done" && task.status !== "canceled"
      } catch {
        return false
      }
    }
    return false
  })

  // Group tasks by date
  const tasksByDate = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {}

    upcomingTasks.forEach((task) => {
      const dateKey = task.deadline || task.date
      if (dateKey) {
        try {
          const date = parseISO(dateKey)
          const key = format(date, "yyyy-MM-dd")
          if (!grouped[key]) {
            grouped[key] = []
          }
          grouped[key].push(task)
        } catch {
          // Invalid date, skip
        }
      }
    })

    return grouped
  }, [upcomingTasks])

  // Get tasks for selected date
  const selectedDateTasks = React.useMemo(() => {
    if (!selectedDate) return []
    const key = format(selectedDate, "yyyy-MM-dd")
    return tasksByDate[key] || []
  }, [selectedDate, tasksByDate])

  // Get dates with tasks for calendar highlighting
  const datesWithTasks = React.useMemo(() => {
    return Object.keys(tasksByDate).map((key) => {
      try {
        return parseISO(key)
      } catch {
        return null
      }
    }).filter((date): date is Date => date !== null)
  }, [tasksByDate])


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" onTaskCreate={addTask} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconCalendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Upcoming</h1>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:hidden">
                          View and manage your upcoming tasks
                        </p>
                      </div>
                    </div>
                    <CreateTaskSheet onTaskCreate={addTask}>
                      <Button className="w-full sm:w-auto">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    </CreateTaskSheet>
                  </div>
                  <p className="text-muted-foreground hidden sm:block">
                    View and manage your upcoming tasks by date
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {error.message || "Failed to load tasks. Please check your Supabase connection."}
                    </AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="w-full space-y-4">
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                      <div className="h-[400px] sm:h-96 animate-pulse rounded-md bg-muted" />
                      <div className="h-[400px] sm:h-96 animate-pulse rounded-md bg-muted" />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
                    {/* Calendar View */}
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold truncate">Calendar</CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                              Click a date to view tasks
                            </CardDescription>
                          </div>
                          <IconCalendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 ml-2" />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 sm:pt-4 flex flex-col items-center px-3 sm:px-6">
                        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 border w-full max-w-md mx-auto">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            modifiers={{
                              hasTasks: datesWithTasks,
                            }}
                            modifiersClassNames={{
                              hasTasks: "relative",
                            }}
                            className="rounded-md w-full [--cell-size:theme(spacing.11)] sm:[--cell-size:theme(spacing.12)]"
                            classNames={{
                              day: "relative flex-1",
                              day_button: "relative flex flex-col items-center justify-center w-full h-full",
                              weekday: "flex-1 text-center",
                            }}
                            components={{
                              DayButton: (props: any) => {
                                const { day, modifiers, ...restProps } = props

                                // react-day-picker passes day as an object with a date property
                                let date: Date | null = null

                                try {
                                  if (day?.date instanceof Date) {
                                    date = day.date
                                  } else if (day instanceof Date) {
                                    date = day
                                  } else if (day?.date) {
                                    date = new Date(day.date)
                                  }

                                  // Validate date
                                  if (!date || isNaN(date.getTime())) {
                                    date = null
                                  }
                                } catch (error) {
                                  date = null
                                }

                                // If date is invalid, use default button
                                if (!date) {
                                  return (
                                    <button
                                      {...restProps}
                                      type="button"
                                      className="relative flex flex-col items-center justify-center aspect-square w-full rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                                    >
                                      <span>{day?.date?.getDate?.() || day?.getDate?.() || ""}</span>
                                    </button>
                                  )
                                }

                                let dateKey = ""
                                try {
                                  dateKey = format(date, "yyyy-MM-dd")
                                } catch (error) {
                                  // If format fails, skip task indicators
                                  return (
                                    <button
                                      {...restProps}
                                      type="button"
                                      className={`
                                        relative flex flex-col items-center justify-center
                                        aspect-square w-full rounded-md
                                        text-sm font-medium transition-all duration-200
                                        hover:bg-accent hover:text-accent-foreground hover:scale-105
                                        ${modifiers?.outside ? "opacity-50 text-muted-foreground" : ""}
                                      `}
                                    >
                                      <span className="relative z-10">{date.getDate()}</span>
                                    </button>
                                  )
                                }

                                const dayTasks = tasksByDate[dateKey] || []
                                const hasTasks = dayTasks.length > 0
                                const highPriorityCount = dayTasks.filter((t: Task) => t.priority === "high").length

                                let isSelected = false
                                try {
                                  if (selectedDate) {
                                    const selectedKey = format(selectedDate, "yyyy-MM-dd")
                                    isSelected = selectedKey === dateKey
                                  }
                                } catch (error) {
                                  isSelected = false
                                }

                                let dayNumber = ""
                                try {
                                  dayNumber = format(date, "d")
                                } catch (error) {
                                  dayNumber = String(date.getDate())
                                }

                                return (
                                  <button
                                    {...restProps}
                                    type="button"
                                    className={`
                                      relative flex flex-col items-center justify-center
                                      aspect-square w-full rounded-md
                                      text-sm font-medium transition-all duration-200
                                      hover:bg-accent hover:text-accent-foreground hover:scale-105
                                      ${isSelected ? "bg-primary text-primary-foreground font-semibold shadow-md" : ""}
                                      ${hasTasks && !isSelected ? "font-semibold text-foreground" : ""}
                                      ${modifiers?.outside ? "opacity-50 text-muted-foreground" : ""}
                                    `}
                                  >
                                    <span className="relative z-10">{dayNumber}</span>
                                    {hasTasks && (
                                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-10 pointer-events-none">
                                        {highPriorityCount > 0 && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm" />
                                        )}
                                        {dayTasks.length > highPriorityCount && (
                                          <div className={`w-1.5 h-1.5 rounded-full shadow-sm ${isSelected ? "bg-primary-foreground" : "bg-blue-500"}`} />
                                        )}
                                      </div>
                                    )}
                                  </button>
                                )
                              },
                            }}
                          />
                        </div>
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs w-full">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">High Priority</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">Tasks</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
                            <span className="text-muted-foreground">Selected</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* All Upcoming Tasks Grouped by Date */}
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg sm:text-xl font-bold">
                              Upcoming Tasks
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm">
                              {upcomingTasks.length > 0
                                ? `${upcomingTasks.length} task${upcomingTasks.length > 1 ? "s" : ""} scheduled`
                                : "No upcoming tasks"}
                            </CardDescription>
                          </div>
                          {upcomingTasks.length > 0 && (
                            <Badge variant="secondary" className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 self-start sm:self-auto">
                              {upcomingTasks.length}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 sm:pt-4 px-3 sm:px-6">
                        {upcomingTasks.length === 0 ? (
                          <div className="text-center py-8 sm:py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-3 sm:mb-4">
                              <IconCalendar className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground font-medium">No upcoming tasks</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Create a task to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
                            {Object.entries(tasksByDate)
                              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                              .map(([dateKey, dateTasks]) => {
                                const date = parseISO(dateKey)
                                const isSelectedDate = selectedDate && format(selectedDate, "yyyy-MM-dd") === dateKey
                                
                                return (
                                  <div 
                                    key={dateKey} 
                                    className={`border rounded-lg p-3 sm:p-4 transition-all ${
                                      isSelectedDate ? "border-primary bg-primary/5" : "border-border"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <IconCalendar className="h-4 w-4 text-primary" />
                                      <h3 className="font-semibold text-sm sm:text-base">
                                        {format(date, "EEEE, MMMM d, yyyy")}
                                      </h3>
                                      <Badge variant="outline" className="text-xs ml-auto">
                                        {dateTasks.length} task{dateTasks.length > 1 ? "s" : ""}
                                      </Badge>
                                    </div>
                                    <div className="space-y-2">
                                       {dateTasks.map((task) => (
                                         <TaskCard
                                           key={task.id}
                                           task={task}
                                           onTaskClick={(task) => {
                                             setSelectedTask(task)
                                             setIsOverviewOpen(true)
                                           }}
                                           onUpdateTask={updateTask}
                                           onDeleteTask={deleteTask}
                                         />
                                       ))}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* All Upcoming Tasks List */}
                {!loading && upcomingTasks.length > 0 && (
                  <Card className="mt-4 sm:mt-6 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="text-lg sm:text-xl">All Upcoming Tasks</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Sorted by date and deadline
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <div className="space-y-4">
                        {Object.entries(tasksByDate)
                          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                          .map(([dateKey, dateTasks]) => {
                            const date = parseISO(dateKey)
                            return (
                              <div key={dateKey} className="border-b last:border-0 pb-4 last:pb-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-semibold text-sm">
                                    {format(date, "EEEE, MMMM d, yyyy")}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {dateTasks.length} task{dateTasks.length > 1 ? "s" : ""}
                                  </Badge>
                                </div>
                                <div className="space-y-2 ml-6">
                                  {dateTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      onClick={() => {
                                        setSelectedTask(task)
                                        setIsOverviewOpen(true)
                                      }}
                                      className="p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{task.title}</span>
                                            <Badge
                                              variant="outline"
                                              className={`text-xs ${task.priority === "high" ? "border-red-500 text-red-600 dark:text-red-400" :
                                                task.priority === "medium" ? "border-yellow-500 text-yellow-600 dark:text-yellow-400" :
                                                  "border-blue-500 text-blue-600 dark:text-blue-400"
                                                }`}
                                            >
                                              {task.priority}
                                            </Badge>
                                          </div>
                                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            {task.date && task.date !== task.deadline && (
                                              <span>Date: {format(parseISO(task.date), "MMM d")}</span>
                                            )}
                                            {task.deadline && (
                                              <span className="flex items-center gap-1">
                                                <IconClock className="h-3 w-3" />
                                                Deadline: {format(parseISO(task.deadline), "MMM d, yyyy")}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs capitalize ml-2">
                                          {task.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      <TaskOverviewSheet
        task={selectedTask}
        open={isOverviewOpen}
        onOpenChange={setIsOverviewOpen}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </SidebarProvider>
  )
}
