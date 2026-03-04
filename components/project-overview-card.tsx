"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconFolder, IconUsers, IconLink, IconCalendar } from "@tabler/icons-react"
import { format, parseISO } from "date-fns"
import { type Project } from "@/hooks/use-projects"
import { type TeamMember } from "@/components/team-mention-input"

interface ProjectOverviewCardProps {
  project: Project
}

export function ProjectOverviewCard({ project }: ProjectOverviewCardProps) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-md"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <IconFolder className="h-5 w-5" style={{ color: project.color }} />
            </div>
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              {project.description && (
                <CardDescription className="mt-1">{project.description}</CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Link */}
        {project.project_link && (
          <div className="flex items-center gap-2">
            <IconLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={project.project_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate"
            >
              {project.project_link}
            </a>
          </div>
        )}

        {/* Due Date */}
        {project.due_date && (
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Due: {format(parseISO(project.due_date), "MMM d, yyyy")}
            </span>
          </div>
        )}

        {/* Team Assigned */}
        {teamMembers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Team Assigned</span>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-border">
                    {member.avatar && (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{member.name}</span>
                    {member.email && (
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
