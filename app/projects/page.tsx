"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useProjects } from "@/hooks/use-projects"
import { useTasks } from "@/hooks/use-tasks"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { CreateTaskSheet } from "@/components/create-task-sheet"
import { TasksTable, type Task } from "@/components/tasks-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type TeamMember } from "@/components/team-mention-input"
import { ProjectOverviewCard } from "@/components/project-overview-card"
import { ProjectOverviewSheet } from "@/components/project-overview-sheet"
import {
  IconFolder,
  IconPlus,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconListDetails,
  IconCircleDot,
} from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function Page() {
  const { projects, loading: projectsLoading, error: projectsError, addProject, updateProject, deleteProject, isLocalMode } = useProjects()
  const { tasks, loading: tasksLoading, error: tasksError, addTask, updateTask, deleteTask } = useTasks()
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = React.useState(false)
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null)
  const [overviewProjectId, setOverviewProjectId] = React.useState<string | null>(null)

  // Get tasks for selected project
  const projectTasks = React.useMemo(() => {
    if (!selectedProjectId) return []
    return tasks.filter(task => task.project_id === selectedProjectId)
  }, [tasks, selectedProjectId])

  // Select first project by default
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Parse team members from JSON string
  const parseTeamMembers = (teamAssigned: string | undefined): TeamMember[] => {
    if (!teamAssigned) return []
    try {
      return JSON.parse(teamAssigned) as TeamMember[]
    } catch {
      return []
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? Tasks in this project will not be deleted.")) {
      return
    }

    try {
      await deleteProject(projectId)
      toast.success("Project deleted successfully")
      if (selectedProjectId === projectId) {
        setSelectedProjectId(projects[0]?.id || null)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    }
  }

  const handleAddTaskToProject = async (task: Omit<Task, "id">) => {
    if (selectedProjectId) {
      await addTask({ ...task, project_id: selectedProjectId })
    } else {
      await addTask(task)
    }
  }

  const loading = projectsLoading || tasksLoading
  const error = projectsError || tasksError


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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <IconFolder className="h-6 w-6 text-purple-500" />
                      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    </div>
                    <CreateProjectDialog onProjectCreate={addProject} open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
                      <Button>
                        <IconPlus className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    </CreateProjectDialog>
                  </div>
                  <p className="text-muted-foreground">
                    Organize your tasks into projects
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {error.message || "Failed to load data. Please check your connection."}
                        </AlertDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 ml-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-white dark:bg-black"
                        onClick={() => {
                          import("@/lib/supabase").then(m => m.useLocalFallback())
                        }}
                      >
                        Try Local Mode
                      </Button>
                    </div>
                  </Alert>
                )}

                {isLocalMode && (
                  <Alert className="mb-6 bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400">
                    <IconCircleDot className="h-4 w-4" />
                    <div className="flex items-center justify-between w-full ml-2">
                      <div>
                        <AlertTitle>Local Mode Active</AlertTitle>
                        <AlertDescription>
                          Using local browser storage. Changes will NOT be synced to Supabase until you return to Online Mode.
                        </AlertDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-500 hover:text-white"
                        onClick={() => {
                          import("@/lib/supabase").then(m => m.useRealSupabase())
                        }}
                      >
                        Return to Online Mode
                      </Button>
                    </div>
                  </Alert>
                )}

                {loading ? (
                  <div className="border rounded-lg mb-6">
                    <div className="divide-y">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                          <Skeleton className="h-10 w-10 rounded-md" />
                          <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="p-6 rounded-full bg-muted mb-6">
                      <IconFolder className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">No Projects Yet</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      Create your first project to start organizing your tasks
                    </p>
                    <CreateProjectDialog onProjectCreate={addProject}>
                      <Button size="lg">
                        <IconPlus className="mr-2 h-5 w-5" />
                        Create Your First Project
                      </Button>
                    </CreateProjectDialog>
                  </div>
                ) : (
                  <>
                    {/* Projects List */}
                    <div className="border rounded-lg mb-6">
                      <div className="divide-y">
                        {projects.map((project) => {
                          const taskCount = tasks.filter(t => t.project_id === project.id).length
                          const isSelected = selectedProjectId === project.id

                          return (
                            <div
                              key={project.id}
                              className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted border-l-4 border-l-primary" : ""
                                }`}
                              onClick={() => {
                                setSelectedProjectId(project.id)
                                setOverviewProjectId(project.id)
                              }}
                            >
                              <div
                                className="p-2 rounded-md shrink-0"
                                style={{ backgroundColor: `${project.color}20` }}
                              >
                                <IconFolder className="h-5 w-5" style={{ color: project.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-base">{project.name}</h3>
                                  {taskCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                                    </Badge>
                                  )}
                                </div>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {project.description}
                                  </p>
                                )}
                                {/* Team Members */}
                                {project.team_assigned && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    {parseTeamMembers(project.team_assigned).slice(0, 3).map((member) => (
                                      <Avatar key={member.id} className="h-6 w-6 border border-border">
                                        {member.avatar && (
                                          <AvatarImage src={member.avatar} alt={member.name} />
                                        )}
                                        <AvatarFallback className="text-[10px]">
                                          {getInitials(member.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {parseTeamMembers(project.team_assigned).length > 3 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{parseTeamMembers(project.team_assigned).length - 3}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <IconDotsVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <EditProjectDialog
                                    project={project}
                                    onProjectUpdate={updateProject}
                                    open={editingProjectId === project.id}
                                    onOpenChange={(open) => setEditingProjectId(open ? project.id : null)}
                                  >
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <IconEdit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  </EditProjectDialog>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <IconTrash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selected Project Details */}
                    {selectedProject && (
                      <>
                        {/* Project Overview Card */}
                        <div className="mb-6">
                          <ProjectOverviewCard project={selectedProject} />
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold">Project Tasks</h2>
                          <CreateTaskSheet onTaskCreate={handleAddTaskToProject}>
                            <Button size="sm">
                              <IconPlus className="mr-2 h-4 w-4" />
                              Add Task
                            </Button>
                          </CreateTaskSheet>
                        </div>

                        {/* Project Tasks */}
                        {projectTasks.length === 0 ? (
                          <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                              <IconListDetails className="h-12 w-12 text-muted-foreground mb-4" />
                              <h3 className="text-lg font-semibold mb-2">No tasks in this project</h3>
                              <p className="text-sm text-muted-foreground text-center">
                                Add your first task to get started
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <TasksTable
                            data={projectTasks}
                            onAddTask={handleAddTaskToProject}
                            onUpdateTask={updateTask}
                            onDeleteTask={deleteTask}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      {/* Project Overview Sheet */}
      {overviewProjectId && (
        <ProjectOverviewSheet
          project={projects.find(p => p.id === overviewProjectId) || null}
          open={overviewProjectId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setOverviewProjectId(null)
            }
          }}
          onProjectUpdate={updateProject}
          onProjectDelete={async (id) => {
            await handleDeleteProject(id)
            setOverviewProjectId(null)
          }}
          taskCount={tasks.filter(t => t.project_id === overviewProjectId).length}
          allProjects={projects}
          onProjectSelect={(projectId) => {
            setOverviewProjectId(projectId)
            setSelectedProjectId(projectId)
          }}
        />
      )}
    </SidebarProvider>
  )
}
