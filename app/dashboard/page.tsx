"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useTasks } from "@/hooks/use-tasks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  IconCheck, 
  IconClock, 
  IconListCheck, 
  IconTrendingUp,
  IconAlertCircle,
  IconCircleDot
} from "@tabler/icons-react"
import { format } from "date-fns"
import Link from "next/link"

export default function Page() {
  const { tasks, loading, error } = useTasks()

  // Calculate statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === "done").length
  const inProgressTasks = tasks.filter(t => t.status === "in progress").length
  const todoTasks = tasks.filter(t => t.status === "todo").length
  const highPriorityTasks = tasks.filter(t => t.priority === "high").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get recent tasks
  const recentTasks = tasks.slice(0, 5)

  // Status distribution
  const statusCounts = {
    todo: tasks.filter(t => t.status === "todo").length,
    "in progress": tasks.filter(t => t.status === "in progress").length,
    done: tasks.filter(t => t.status === "done").length,
    backlog: tasks.filter(t => t.status === "backlog").length,
    canceled: tasks.filter(t => t.status === "canceled").length,
  }

  // Priority distribution
  const priorityCounts = {
    high: tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low: tasks.filter(t => t.priority === "low").length,
  }

  const stats = [
    {
      title: "Total Tasks",
      value: totalTasks,
      description: "All tasks",
      icon: IconListCheck,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Completed",
      value: completedTasks,
      description: `${completionRate}% completion rate`,
      icon: IconCheck,
      color: "text-green-600 dark:text-green-400",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      description: "Active tasks",
      icon: IconClock,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "High Priority",
      value: highPriorityTasks,
      description: "Urgent tasks",
      icon: IconAlertCircle,
      color: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    Overview of your tasks and productivity
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive">
                    <p className="font-medium">Error loading dashboard</p>
                    <p className="text-sm mt-1">{error.message}</p>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                          <CardHeader>
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16 mt-2" />
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {stats.map((stat) => {
                        const Icon = stat.icon
                        return (
                          <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                {stat.title}
                              </CardTitle>
                              <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{stat.value}</div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Charts and Lists Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                      {/* Status Distribution */}
                      <Card className="lg:col-span-3">
                        <CardHeader>
                          <CardTitle>Task Status</CardTitle>
                          <CardDescription>Distribution of tasks by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(statusCounts).map(([status, count]) => {
                              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
                              return (
                                <div key={status} className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="capitalize font-medium">{status}</span>
                                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Priority Distribution */}
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Priority</CardTitle>
                          <CardDescription>Tasks by priority level</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(priorityCounts).map(([priority, count]) => {
                              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
                              const priorityColors = {
                                high: "bg-red-500",
                                medium: "bg-yellow-500",
                                low: "bg-blue-500",
                              }
                              return (
                                <div key={priority} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`} />
                                    <span className="text-sm font-medium capitalize">{priority}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-semibold">{count}</div>
                                    <div className="text-xs text-muted-foreground">{percentage}%</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Stats */}
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle>Quick Stats</CardTitle>
                          <CardDescription>Task insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">To Do</span>
                              <Badge variant="outline">{todoTasks}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Completion Rate</span>
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400">
                                {completionRate}%
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Backlog</span>
                              <Badge variant="outline">{statusCounts.backlog}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Canceled</span>
                              <Badge variant="outline">{statusCounts.canceled}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Tasks */}
                    <Card>
                      <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription>Latest tasks you've created</CardDescription>
                              </div>
                              <Link 
                                href="/lists" 
                                className="text-sm text-primary hover:underline"
                              >
                                View all
                              </Link>
                            </div>
                      </CardHeader>
                      <CardContent>
                        {recentTasks.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <IconCircleDot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No tasks yet</p>
                            <p className="text-sm mt-1">Create your first task to get started</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentTasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium truncate">{task.title}</h4>
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {task.status}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`capitalize text-xs ${
                                        task.priority === "high" ? "border-red-500 text-red-600 dark:text-red-400" :
                                        task.priority === "medium" ? "border-yellow-500 text-yellow-600 dark:text-yellow-400" :
                                        "border-blue-500 text-blue-600 dark:text-blue-400"
                                      }`}
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {task.description}
                                    </p>
                                  )}
                                  {task.deadline && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Deadline: {format(new Date(task.deadline), "MMM d, yyyy")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
