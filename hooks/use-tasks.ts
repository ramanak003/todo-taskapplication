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
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        // Check if table doesn't exist
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          throw new Error(
            "Tasks table not found. Please run the SQL schema from supabase-schema.sql in your Supabase dashboard."
          )
        }
        // Check if RLS is blocking access
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          throw new Error(
            "Permission denied. Please check your Row Level Security (RLS) policies in Supabase."
          )
        }
        throw new Error(error.message || "Failed to fetch tasks from database")
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
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
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
        }
        setTasks(prev => [newTask, ...prev])
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
      return data
    } catch (err) {
      console.error("Error updating task:", err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log("Attempting to delete task:", id)
      
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
    } catch (err) {
      console.error("Error deleting task:", err)
      throw err
    }
  }

  const deleteAllTasks = async () => {
    try {
      console.log("Attempting to delete all tasks")
      const taskCount = tasks.length
      
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
