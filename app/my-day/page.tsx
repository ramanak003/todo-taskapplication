"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { TasksTable } from "@/components/tasks-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTasks } from "@/hooks/use-tasks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconSun, IconCalendar } from "@tabler/icons-react"
import { format, isToday, parseISO } from "date-fns"

export default function Page() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks()

  // Filter tasks for "My Day" - tasks due today or with today's date
  const myDayTasks = tasks.filter((task) => {
    if (task.date) {
      try {
        const taskDate = parseISO(task.date)
        return isToday(taskDate)
      } catch {
        return false
      }
    }
    if (task.deadline) {
      try {
        const deadline = parseISO(task.deadline)
        return isToday(deadline)
      } catch {
        return false
      }
    }
    // Include tasks without dates that are in progress or todo
    return task.status === "in progress" || task.status === "todo"
  })

  const todayTasks = myDayTasks.filter((task) => {
    if (task.date) {
      try {
        return isToday(parseISO(task.date))
      } catch {
        return false
      }
    }
    return false
  })

  const overdueTasks = myDayTasks.filter((task) => {
    if (task.deadline) {
      try {
        const deadline = parseISO(task.deadline)
        return deadline < new Date() && !isToday(deadline) && task.status !== "done"
      } catch {
        return false
      }
    }
    return false
  })

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
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <IconSun className="h-6 w-6 text-orange-500" />
                    <h1 className="text-3xl font-bold tracking-tight">My Day</h1>
                  </div>
                  <p className="text-muted-foreground">
                    Focus on today's tasks and priorities
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{todayTasks.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled for today
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{myDayTasks.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tasks in your day
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {overdueTasks.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Need attention
                      </p>
                    </CardContent>
                  </Card>
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
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-[150px] animate-pulse rounded-md bg-muted" />
                      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                    </div>
                    <div className="rounded-md border">
                      <div className="h-96 animate-pulse bg-muted" />
                    </div>
                  </div>
                ) : (
                  <>
                    {overdueTasks.length > 0 && (
                      <Card className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                        <CardHeader>
                          <CardTitle className="text-red-600 dark:text-red-400">
                            Overdue Tasks
                          </CardTitle>
                          <CardDescription>
                            These tasks have passed their deadline
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {overdueTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-2 rounded border border-red-200 dark:border-red-900">
                                <div>
                                  <p className="font-medium text-sm">{task.title}</p>
                                  {task.deadline && (
                                    <p className="text-xs text-muted-foreground">
                                      Due: {format(parseISO(task.deadline), "MMM d, yyyy")}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">
                                  Overdue
                                </Badge>
                              </div>
                            ))}
                            {overdueTasks.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center pt-2">
                                +{overdueTasks.length - 3} more overdue tasks
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    <TasksTable 
                      data={myDayTasks} 
                      onAddTask={addTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
