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
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react"

export default function Page() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks()

  // Filter high and medium priority tasks
  const importantTasks = tasks.filter((task) => 
    task.priority === "high" || task.priority === "medium"
  ).sort((a, b) => {
    // Sort by priority (high first), then by status
    if (a.priority === "high" && b.priority !== "high") return -1
    if (a.priority !== "high" && b.priority === "high") return 1
    return 0
  })

  const highPriorityTasks = importantTasks.filter((task) => task.priority === "high")
  const mediumPriorityTasks = importantTasks.filter((task) => task.priority === "medium")
  const inProgressImportant = importantTasks.filter((task) => task.status === "in progress")
  const todoImportant = importantTasks.filter((task) => task.status === "todo")

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
                    <IconAlertCircle className="h-6 w-6 text-red-500" />
                    <h1 className="text-3xl font-bold tracking-tight">Important</h1>
                  </div>
                  <p className="text-muted-foreground">
                    High and medium priority tasks that need your attention
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card className="border-red-200 dark:border-red-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <IconAlertCircle className="h-4 w-4 text-red-500" />
                        High Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {highPriorityTasks.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Urgent tasks
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200 dark:border-yellow-900">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                        Medium Priority
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {mediumPriorityTasks.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Important tasks
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{inProgressImportant.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active important
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">To Do</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{todoImportant.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pending important
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
                  <TasksTable 
                    data={importantTasks} 
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
