"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { IconLink, IconCalendar } from "@tabler/icons-react"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { type Project } from "@/hooks/use-projects"
import { toast } from "sonner"
import { TeamMentionInput } from "@/components/team-mention-input"


interface EditProjectDialogProps {
  project: Project
  onProjectUpdate: (id: string, updates: Partial<Omit<Project, "id" | "created_at" | "updated_at">>) => Promise<void>
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditProjectDialog({ project, onProjectUpdate, children, open: controlledOpen, onOpenChange }: EditProjectDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [name, setName] = React.useState(project.name)
  const [description, setDescription] = React.useState(project.description || "")
  const [projectLink, setProjectLink] = React.useState(project.project_link || "")
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    project.due_date ? parseISO(project.due_date) : undefined
  )
  const [teamAssigned, setTeamAssigned] = React.useState(project.team_assigned || "") // JSON string of team members
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Update form when project changes
  React.useEffect(() => {
    setName(project.name)
    setDescription(project.description || "")
    setProjectLink(project.project_link || "")
    setDueDate(project.due_date ? parseISO(project.due_date) : undefined)
    setTeamAssigned(project.team_assigned || "")
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onProjectUpdate(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        project_link: projectLink.trim() || undefined,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
        team_assigned: teamAssigned.trim() || undefined,
      })

      toast.success("Project updated successfully", {
        description: `"${name.trim()}" has been updated.`,
        duration: 3000,
      })

      setOpen(false)
    } catch (error) {
      console.error("Error updating project:", error)
      toast.error("Failed to update project", {
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-semibold">Edit Project</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Update your project details. All fields except name are optional.
            </DialogDescription>
          </DialogHeader>
          <div className={`space-y-6 py-2 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Project Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-semibold">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g., Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-semibold">
                Description
              </Label>
              <Textarea
                id="project-description"
                placeholder="What is this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Project Link */}
            <div className="space-y-2">
              <Label htmlFor="project-link" className="text-sm font-semibold flex items-center gap-2">
                <IconLink className="h-4 w-4" />
                Project Link
              </Label>
              <Input
                id="project-link"
                type="url"
                placeholder="https://example.com/project"
                value={projectLink}
                onChange={(e) => setProjectLink(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due-date" className="text-sm font-semibold flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM d, yyyy") : <span>Select due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Team Assigned */}
            <TeamMentionInput
              value={teamAssigned}
              onChange={setTeamAssigned}
              label="Team Assigned"
              placeholder="Type @ to mention team members"
            />
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
              disabled={isSubmitting || !name.trim()}
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
                  <span>Updating...</span>
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
