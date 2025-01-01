'use client'

import { useState, useEffect } from 'react'
import { useApi } from "../hooks/useApi";
import { Button } from "@shadcn/components/ui/button";

interface Project {
  id: number
  name: string
  created_at: string
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const { fetchData, isLoading, error } = useApi<Project[]>()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const data = await fetchData('getProjects')
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const handleDeleteProject = async (id: number) => {
    try {
      await fetchData('deleteProject', { id: id.toString() })
      fetchProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  if (isLoading) return <div>Loading projects...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-between items-center">
            <span>{project.name} (Created: {new Date(project.created_at).toLocaleDateString()})</span>
            <Button onClick={() => handleDeleteProject(project.id)} variant="destructive">
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

