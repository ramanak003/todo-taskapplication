"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  IconFolder,
  IconUsers,
  IconLink,
  IconCalendar,
  IconX,
  IconEdit,
  IconTrash,
  IconListDetails,
} from "@tabler/icons-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Project } from "@/hooks/use-projects"
import { type TeamMember } from "@/components/team-mention-input"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { TeamMemberDetailSheet } from "@/components/team-member-detail-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface ProjectOverviewSheetProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdate?: (id: string, updates: Partial<Project>) => Promise<void>
  onProjectDelete?: (id: string) => Promise<void>
  taskCount?: number
  allProjects?: Project[] // For showing linked projects
  onProjectSelect?: (projectId: string) => void // Callback when a linked project is clicked
}

export function ProjectOverviewSheet({
  project,
  open,
  onOpenChange,
  onProjectUpdate,
  onProjectDelete,
  taskCount = 0,
  allProjects = [],
  onProjectSelect,
}: ProjectOverviewSheetProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null)
  const [isMemberSheetOpen, setIsMemberSheetOpen] = React.useState(false)

  if (!project) return null

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

  const teamMembers = parseTeamMembers(project.team_assigned)

  // Get linked projects (projects that share team members with this project)
  const getLinkedProjects = (): Project[] => {
    if (!project || teamMembers.length === 0) return []

    return allProjects.filter((p) => {
      if (p.id === project.id) return false // Exclude current project
      const pMembers = parseTeamMembers(p.team_assigned)
      // Check if any team member is shared
      return pMembers.some((pm) =>
        teamMembers.some((tm) => tm.id === pm.id || tm.email === pm.email)
      )
    })
  }

  const linkedProjects = getLinkedProjects()

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setIsMemberSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!onProjectDelete) return

    setIsDeleting(true)
    try {
      await onProjectDelete(project.id)
      toast.success("Project deleted successfully")
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm border-b">
          <SheetHeader className="px-6 pt-6 pb-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="p-2 rounded-md shrink-0"
                  style={{ backgroundColor: `${project.color}20` }}
                >
                  <IconFolder className="h-5 w-5" style={{ color: project.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-2xl font-bold leading-tight pr-8">
                    {project.name}
                  </SheetTitle>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
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
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 space-y-6">
          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconListDetails className="h-4 w-4" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskCount}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks in this project
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconUsers className="h-4 w-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned to project
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Project Link */}
          {project.project_link && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconLink className="h-4 w-4 text-primary" />
                  </div>
                  <span>Project Link</span>
                </div>
                <div className="pl-9">
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {project.project_link}
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Due Date */}
          {project.due_date && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconCalendar className="h-4 w-4 text-primary" />
                  </div>
                  <span>Due Date</span>
                </div>
                <div className="pl-9">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(parseISO(project.due_date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Team Assigned */}
          {teamMembers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconUsers className="h-4 w-4 text-primary" />
                  </div>
                  <span>Team Assigned</span>
                </div>
                <div className="pl-9 space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleMemberClick(member)}
                    >
                      <Avatar className="h-10 w-10 border border-border cursor-pointer">
                        {member.avatar && (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{member.name}</div>
                        {member.email && (
                          <div className="text-xs text-muted-foreground">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Linked Projects */}
          {linkedProjects.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <IconFolder className="h-4 w-4 text-primary" />
                  </div>
                  <span>Linked Projects</span>
                </div>
                <div className="pl-9 space-y-2">
                  {linkedProjects.map((linkedProject) => (
                    <div
                      key={linkedProject.id}
                      className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (onProjectSelect) {
                          onProjectSelect(linkedProject.id)
                        }
                      }}
                    >
                      <div
                        className="p-2 rounded-md shrink-0"
                        style={{ backgroundColor: `${linkedProject.color}20` }}
                      >
                        <IconFolder className="h-4 w-4" style={{ color: linkedProject.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{linkedProject.name}</div>
                        {linkedProject.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {linkedProject.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Project Metadata */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-primary/10">
                <IconFolder className="h-4 w-4 text-primary" />
              </div>
              <span>Details</span>
            </div>
            <div className="pl-9 space-y-2">
              <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                <span className="text-xs font-medium text-muted-foreground">Project ID</span>
                <span className="text-xs font-mono text-foreground">{project.id.slice(0, 8)}...</span>
              </div>
              {project.created_at && (
                <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Created</span>
                  <span className="text-xs text-foreground">
                    {format(parseISO(project.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t bg-background px-6 py-4">
          <div className="flex items-center gap-2">
            {onProjectUpdate && (
              <EditProjectDialog
                project={project}
                onProjectUpdate={onProjectUpdate}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <Button variant="outline" className="flex-1" disabled={isDeleting}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit Project
                </Button>
              </EditProjectDialog>
            )}
            {onProjectDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isDeleting}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the{" "}
                      <span className="font-bold text-foreground">{project.name}</span> project
                      and all its associated tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </SheetContent>
      {/* Team Member Detail Sheet */}
      <TeamMemberDetailSheet
        member={selectedMember}
        open={isMemberSheetOpen}
        onOpenChange={setIsMemberSheetOpen}
        role="Member"
        status="active"
        joinedAt={new Date()}
      />
    </Sheet>
  )
}
