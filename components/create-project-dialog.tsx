"use client"

import * as React from "react"
import { format } from "date-fns"
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


interface CreateProjectDialogProps {
  children: React.ReactNode
  onProjectCreate?: (project: Omit<Project, "id" | "created_at" | "updated_at">) => Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateProjectDialog({ children, onProjectCreate, open: controlledOpen, onOpenChange }: CreateProjectDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [projectLink, setProjectLink] = React.useState("")
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined)
  const [teamAssigned, setTeamAssigned] = React.useState("") // JSON string of team members
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (onProjectCreate) {
        // Only include team_assigned if it's not empty and is valid JSON
        let teamAssignedValue: string | undefined = undefined
        if (teamAssigned.trim()) {
          try {
            // Validate it's valid JSON
            JSON.parse(teamAssigned.trim())
            teamAssignedValue = teamAssigned.trim()
          } catch {
            // If not valid JSON, skip it
            console.warn("Invalid team_assigned JSON, skipping")
          }
        }

        await onProjectCreate({
          name: name.trim(),
          description: description.trim() || undefined,
          color: "#6366f1", // Default color
          icon: "folder",
          project_link: projectLink.trim() || undefined,
          due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
          team_assigned: teamAssignedValue,
        })
      }

      toast.success("Project created successfully", {
        description: `"${name.trim()}" has been created.`,
        duration: 3000,
      })

      // Reset form
      setName("")
      setDescription("")
      setProjectLink("")
      setDueDate(undefined)
      setTeamAssigned("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating project:", error)
      toast.error("Failed to create project", {
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-semibold">Create New Project</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Create a project to organize your tasks. All fields except name are optional.
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
                  <span>Creating...</span>
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
