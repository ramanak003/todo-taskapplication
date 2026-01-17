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
import { IconFolder, IconFolderOpen } from "@tabler/icons-react"

export default function Page() {
  const { tasks, loading, error, addTask, updateTask, deleteTask } = useTasks()

  // For now, show all tasks. In the future, this could filter by project
  const projectTasks = tasks

  // Group by status for project overview
  const byStatus = {
    todo: projectTasks.filter((t) => t.status === "todo").length,
    "in progress": projectTasks.filter((t) => t.status === "in progress").length,
    done: projectTasks.filter((t) => t.status === "done").length,
    backlog: projectTasks.filter((t) => t.status === "backlog").length,
  }

  const activeProjects = projectTasks.filter((t) => 
    t.status === "in progress" || t.status === "todo"
  ).length

  const completedProjects = projectTasks.filter((t) => 
    t.status === "done"
  ).length

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
                    <IconFolder className="h-6 w-6 text-purple-500" />
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                  </div>
                  <p className="text-muted-foreground">
                    All your project tasks and work items
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{projectTasks.length}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        All project tasks
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {activeProjects}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        In progress or todo
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {completedProjects}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Finished tasks
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Backlog</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{byStatus.backlog}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pending tasks
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
                    data={projectTasks} 
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
