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

export default function Page() {
  const { tasks, loading, error, addTask, updateTask, deleteTask, deleteAllTasks } = useTasks()

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
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">Welcome back!</h2>
                  <p className="text-muted-foreground">
                    Here's a list of your tasks for this month.
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
                    data={tasks} 
                    onAddTask={addTask}
                    onUpdateTask={updateTask}
                    onDeleteTask={deleteTask}
                    onDeleteAll={deleteAllTasks}
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
