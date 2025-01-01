'use client'

import React, { useEffect, useState } from 'react'
import { useApi } from "../hooks/useApi";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@shadcn/components/ui/select";

interface Upload {
    id: number
    student_name: string
    project_id: number
    file_path: string
    uploaded_at: string
}

interface Project {
    id: number
    name: string
}

export function UploadsList() {
    const [uploads, setUploads] = useState<Upload[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<string>('')
    const { fetchData, isLoading, error } = useApi<Upload[]>()

    useEffect(() => {
        fetchProjects()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchUploads(selectedProject)
        }
    }, [selectedProject])

    const fetchProjects = async () => {
        try {
            const data = await fetchData('getProjects')
            setProjects(data)
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    }

    const fetchUploads = async (projectId: string) => {
        try {
            const data = await fetchData('getUploads', { project_id: projectId })
            setUploads(data)
        } catch (error) {
            console.error('Failed to fetch uploads:', error)
        }
    }

    if (isLoading) return <div>Loading uploads...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Uploads</h2>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                    {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {selectedProject && (
                <ul className="mt-4 space-y-2">
                    {uploads.map((upload) => (
                        <li key={upload.id}>
                            {upload.student_name} - {upload.file_path} (Uploaded: {new Date(upload.uploaded_at).toLocaleString()})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

