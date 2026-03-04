"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export type Project = {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  project_link?: string
  due_date?: string
  team_assigned?: string
  created_at?: string
  updated_at?: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase detailed error (projects):", JSON.stringify(error, null, 2))
      }

      const transformedProjects: Project[] = (data || []).map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description || undefined,
        color: project.color || "#6366f1",
        icon: project.icon || "folder",
        project_link: project.project_link || undefined,
        due_date: project.due_date || undefined,
        team_assigned: project.team_assigned || undefined,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }))

      setProjects(transformedProjects)
      setError(null)
    } catch (err) {
      console.error("Error fetching projects:", err)

      const isFetchError = err instanceof Error &&
        (err.message.includes("fetch") || err.message.includes("Failed to fetch") || err.message.includes("network"));

      const isConnectionTimeout = err instanceof Error &&
        (err.message.includes("timeout") || err.message.includes("aborted"));

      let errorMessage = err instanceof Error
        ? err.message
        : "Failed to fetch projects"

      if (isFetchError || isConnectionTimeout) {
        errorMessage = "Network error connecting to Supabase. This often happens if your internet is down or if your Supabase project is currently PAUSED. Please check your Supabase dashboard at https://supabase.com/dashboard and resume the project if needed."
      }

      setError(new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload: any) => {
          console.log("Real-time project update:", payload)
          fetchProjects()
        }
      )
      .subscribe((status: string) => {
        console.log("Projects subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProjects])

  const addProject = async (project: Omit<Project, "id" | "created_at" | "updated_at">) => {
    try {
      console.log("Adding project:", project)

      // Only include fields that exist (handle missing columns gracefully)
      const projectData: Partial<Project> = {
        name: project.name,
        description: project.description,
        color: project.color,
        icon: project.icon,
      }

      // Only add optional fields if they have values
      if (project.project_link) {
        projectData.project_link = project.project_link
      }
      if (project.due_date) {
        projectData.due_date = project.due_date
      }
      if (project.team_assigned) {
        projectData.team_assigned = project.team_assigned
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)

        // Check if it's a column missing error
        if (error.message?.includes("column") && error.message?.includes("does not exist")) {
          throw new Error(
            "Database columns missing. Please run the SQL migration from 'add-project-fields.sql' in your Supabase dashboard."
          )
        }

        throw new Error(error.message || "Failed to add project")
      }

      console.log("Project added successfully:", data)

      // Optimistically update local state
      if (data) {
        const newProject: Project = {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          color: data.color || "#6366f1",
          icon: data.icon || "folder",
          project_link: data.project_link || undefined,
          due_date: data.due_date || undefined,
          team_assigned: data.team_assigned || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        }
        setProjects(prev => [newProject, ...prev])
      }

      return data
    } catch (err) {
      console.error("Error adding project:", err)
      throw err
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      console.log("Updating project:", id, updates)

      // Optimistically update local state
      setProjects(prev => prev.map(project =>
        project.id === id ? { ...project, ...updates } : project
      ))

      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update error:", error)
        // Revert optimistic update on error
        await fetchProjects()
        throw new Error(error.message || "Failed to update project")
      }

      console.log("Project updated successfully:", data)
      return data
    } catch (err) {
      console.error("Error updating project:", err)
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      console.log("Attempting to delete project:", id)

      // Optimistically update local state
      setProjects(prev => prev.filter(project => project.id !== id))

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Supabase delete error:", error)
        // Revert optimistic update on error
        await fetchProjects()
        throw new Error(error.message || "Failed to delete project")
      }

      console.log("Project deleted successfully")
    } catch (err) {
      console.error("Error deleting project:", err)
      throw err
    }
  }

  const isLocalMode = typeof window !== 'undefined' && window.localStorage.getItem('supabase_fallback_active') === 'true'

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
    isLocalMode,
  }
}
