'use client'

import { useState, useEffect } from 'react'
import { useApi } from "../hooks/useApi";
import { Button } from "@shadcn/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";

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

  if (isLoading) return <div className="text-center">Loading projects...</div>
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>

  return (
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {projects.map((project) => (
                <li key={project.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                  <span>{project.name} <span className="text-sm text-gray-500">(Created: {new Date(project.created_at).toLocaleDateString()})</span></span>
                  <Button onClick={() => handleDeleteProject(project.id)} variant="destructive" size="sm">
                    Delete
                  </Button>
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
  )
}

