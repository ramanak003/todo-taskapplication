"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { type Task } from "@/components/tasks-table"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        // Order by position if present, falling back to created_at
        .order("position", { ascending: true, nullsFirst: true })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase detailed error:", JSON.stringify(error, null, 2))

        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          throw new Error(
            "Tasks table not found. Please run the SQL schema in Supabase."
          )
        }

        // Check for stale schema cache (PGRST205)
        if (error.code === 'PGRST205') {
          throw new Error(
            "Supabase Schema Cache is stale. Please run: NOTIFY pgrst, 'reload schema'; in your Supabase SQL Editor."
          )
        }

        // Check if RLS is blocking access
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          throw new Error(
            "Permission denied. Check RLS policies."
          )
        }
        throw new Error(error.message || "Failed to fetch tasks")
      }

      // Transform Supabase data to Task format
      const transformedTasks: Task[] = (data || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status as Task["status"],
        priority: task.priority as Task["priority"],
        date: task.date || undefined,
        deadline: task.deadline || undefined,
        reminder: task.reminder || undefined,
        position: typeof task.position === "number" ? task.position : null,
      }))

      setTasks(transformedTasks)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : "Failed to fetch tasks. Please ensure the tasks table exists in your Supabase database."

      setError(new Error(errorMessage))
      console.error("Error fetching tasks:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const logTaskChange = useCallback(
    async (
      params:
        | {
          action: "created"
          task: Task
        }
        | {
          action: "updated" | "status_changed"
          before: Task
          after: Task
        }
        | {
          action: "deleted"
          task: Task
        }
    ) => {
      try {
        const baseValues = (task: Task) => ({
          title: task.title,
          description: task.description ?? null,
          status: task.status,
          priority: task.priority,
          date: task.date ?? null,
          deadline: task.deadline ?? null,
          reminder: task.reminder ?? null,
          project_id: task.project_id ?? null,
        })

        if (params.action === "created") {
          await supabase.from("task_audit_logs").insert({
            task_id: params.task.id,
            action: "created",
            previous_values: null,
            new_values: baseValues(params.task),
            actor_name: "System",
            actor_email: null,
          })
        } else if (params.action === "deleted") {
          await supabase.from("task_audit_logs").insert({
            task_id: params.task.id,
            action: "deleted",
            previous_values: baseValues(params.task),
            new_values: null,
            actor_name: "System",
            actor_email: null,
          })
        } else {
          const { before, after } = params
          const isOnlyStatusChanged =
            before.status !== after.status &&
            before.title === after.title &&
            before.description === after.description &&
            before.priority === after.priority &&
            before.date === after.date &&
            before.deadline === after.deadline &&
            before.reminder === after.reminder &&
            before.project_id === after.project_id

          await supabase.from("task_audit_logs").insert({
            task_id: after.id,
            action: isOnlyStatusChanged ? "status_changed" : "updated",
            previous_values: baseValues(before),
            new_values: baseValues(after),
            actor_name: "System",
            actor_email: null,
          })
        }
      } catch (err) {
        console.error("Failed to log task change:", err)
        // Do not throw; logging should never break the main action
      }
    },
    []
  )

  useEffect(() => {
    fetchTasks()

    // Subscribe to real-time changes
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          console.log("Real-time update received:", payload)
          fetchTasks()
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  const addTask = async (task: Omit<Task, "id">) => {
    try {
      console.log("Adding task:", task)
      // Determine a position for the new task: append to the end
      const maxPosition =
        tasks.length > 0
          ? Math.max(
            ...tasks.map((t) =>
              typeof t.position === "number" ? t.position : 0
            )
          )
          : -1

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...task,
            position: maxPosition + 1,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
        throw new Error(error.message || "Failed to add task")
      }

      console.log("Task added successfully:", data)

      // Optimistically update local state
      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          status: data.status as Task["status"],
          priority: data.priority as Task["priority"],
          date: data.date || undefined,
          deadline: data.deadline || undefined,
          reminder: data.reminder || undefined,
          position:
            typeof data.position === "number" ? data.position : maxPosition + 1,
        }
        setTasks(prev => [newTask, ...prev])

        // Log creation
        await logTaskChange({ action: "created", task: newTask })
      }

      return data
    } catch (err) {
      console.error("Error adding task:", err)
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log("Updating task:", id, updates)
      const before = tasks.find((t) => t.id === id) ?? null

      // Optimistically update local state
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ))

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update error:", error)
        // Revert optimistic update on error
        await fetchTasks()
        throw new Error(error.message || "Failed to update task")
      }

      console.log("Task updated successfully:", data)
      if (before) {
        const after: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          status: data.status as Task["status"],
          priority: data.priority as Task["priority"],
          date: data.date || undefined,
          deadline: data.deadline || undefined,
          reminder: data.reminder || undefined,
          position:
            typeof data.position === "number" ? data.position : before.position ?? null,
          project_id: data.project_id ?? before.project_id,
        }
        await logTaskChange({ action: "updated", before, after })
      }
      return data
    } catch (err) {
      console.error("Error updating task:", err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log("Attempting to delete task:", id)
      const toDelete = tasks.find((t) => t.id === id) ?? null

      // Optimistically update local state
      setTasks(prev => prev.filter(task => task.id !== id))

      const { error, data } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .select()

      if (error) {
        console.error("Supabase delete error:", error)
        // Revert optimistic update on error
        await fetchTasks()
        throw new Error(error.message || "Failed to delete task")
      }

      console.log("Task deleted successfully:", data)
      if (toDelete) {
        await logTaskChange({ action: "deleted", task: toDelete })
      }
    } catch (err) {
      console.error("Error deleting task:", err)
      throw err
    }
  }

  const deleteAllTasks = async () => {
    try {
      console.log("Attempting to delete all tasks")
      const snapshot = [...tasks]
      const taskCount = snapshot.length

      // Optimistically clear local state
      setTasks([])

      const { error } = await supabase
        .from("tasks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all rows

      if (error) {
        console.error("Supabase delete all error:", error)
        // Revert optimistic update on error
        await fetchTasks()
        throw new Error(error.message || "Failed to delete all tasks")
      }

      console.log("All tasks deleted successfully")
      // Log deletions (best-effort)
      await Promise.all(
        snapshot.map((task) => logTaskChange({ action: "deleted", task }))
      )
      return taskCount
    } catch (err) {
      console.error("Error deleting all tasks:", err)
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    deleteAllTasks,
  }
}
