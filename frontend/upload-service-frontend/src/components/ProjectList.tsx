'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Badge } from "@shadcn/components/ui/badge";
import { Skeleton } from "@shadcn/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { File, PlusCircle, Share2, Trash2, User } from 'lucide-react';
import { useApi } from "../hooks/useApi";
import { NewProjectModal } from './NewProjectModal';
import { ShareProjectModal } from "./ShareProjectModal";

export interface Project {
    id: number
    name: string
    created_at: string
    students: number
    files: number
}

interface ProjectListProps {
    onProjectClick: (project: Project | null) => void
}

export function ProjectList({ onProjectClick }: ProjectListProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const { fetchData, isLoading, error } = useApi<Project[]>()
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
    const [shareProject, setShareProject] = useState<Project | null>(null)

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
        const isConfirmed = window.confirm('Are you sure you want to delete this project?');
        if (!isConfirmed) return;

        try {
            await fetchData('deleteProject', { id: id.toString() });
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    }

    const handleCreateProject = async (name: string) => {
        try {
            await fetchData('createProject', {}, { name });
            fetchProjects();
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    }

    if (isLoading) return (<>
        <Skeleton className="h-4 w-1/2 mb-4"/>
        <Skeleton className="h-4 w-1/3 mb-4"/>
        <Skeleton className="h-4 w-1/4 mb-4"/>
    </>)
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Card key={project.id} className="flex flex-col cursor-pointer"
                              onClick={() => onProjectClick(project)}>
                            <CardHeader className="py-3 px-6">
                                <CardTitle className="flex justify-between items-center">
                                    {project.name} <span className="text-sm text-gray-500">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow pb-4">

                                <Badge className="mr-1 cursor-default">
                                    <User className="h-4 w-4 mr-2"/>
                                    {project.students} students
                                </Badge>
                                <Badge className="mr-1 cursor-default">
                                    <File className="h-4 w-4 mr-2"/>
                                    {project.files} files
                                </Badge>

                                <Badge className="mr-1" variant="blue" onClick={() => setShareProject(project)}>
                                    <Share2 className="h-4 w-4 mr-2"/>
                                    Share
                                </Badge>

                                <TooltipProvider delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge variant="destructive" className="mr-1 cursor-pointer"
                                                   onClick={(e) => {
                                                       e.stopPropagation();
                                                       handleDeleteProject(project.id);
                                                   }}>
                                                <Trash2 className="h-4 w-4 mr-2"/>
                                                Delete
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Deleting a project does not delete the files associated with it.<br/>
                                            Ask your system administrator to delete the files.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                            </CardContent>
                        </Card>
                    ))}

                    {/* add new project */}
                    <Card
                        className="flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => setIsNewProjectModalOpen(true)}
                    >
                        <CardHeader className="py-3 px-6">
                        </CardHeader>
                        <CardContent>
                            <PlusCircle className="h-12 w-12 text-gray-500"/>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>

            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => setIsNewProjectModalOpen(false)}
                onCreateProject={handleCreateProject}
            />

            <ShareProjectModal
                isOpen={!!shareProject}
                onClose={() => setShareProject(null)}
                project={shareProject}
            />
        </Card>
    )
}
