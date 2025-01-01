'use client'

import React, { useEffect, useState } from 'react'
import { generateDownloadUrl, useApi } from "../hooks/useApi";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@shadcn/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Button } from "@shadcn/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { Download, DownloadCloud } from 'lucide-react';
import JSZip from "jszip";

interface Upload {
    id: number
    student_name: string
    project_id: number
    file_path: string
    file_name: string
    uploaded_at: string
}

interface Project {
    id: number
    name: string
}

interface GroupedUploads {
    [studentName: string]: Upload[]
}

export function UploadsList() {
    const [groupedUploads, setGroupedUploads] = useState<GroupedUploads>({})
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
            const grouped = data.reduce((acc: GroupedUploads, upload: Upload) => {
                if (!acc[upload.student_name]) {
                    acc[upload.student_name] = []
                }
                acc[upload.student_name].push(upload)
                return acc
            }, {})
            setGroupedUploads(grouped)
        } catch (error) {
            console.error('Failed to fetch uploads:', error)
        }
    }

    const downloadFile = async (fileUrl: string) => {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileUrl.split('/').pop() as string;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file: ' + fileUrl);
        }
    }

    const handleDownloadAllUploads = async (uploads: Upload[]) => {
        // generate a zip file with all the files. all files must be requested individually.

        const downloadUrls = uploads.map(upload => {
            return {
                upload: upload,
                url: generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)
            }
        });

        const zip = new JSZip();
        for (const { upload, url } of downloadUrls) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to download file');
                }
                const blob = await response.blob();
                zip.file(upload.file_name, blob);
            } catch (error) {
                console.error('Error downloading file:', error);
                alert('Failed to download file: ' + upload.file_name);
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            const url = window.URL.createObjectURL(content);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'uploads.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    if (isLoading) return <div className="text-center">Loading uploads...</div>
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Uploads</CardTitle>
            </CardHeader>
            <CardContent>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full mb-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Object.entries(groupedUploads).map(([studentName, uploads]) => (
                            <Card key={studentName} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{studentName}</CardTitle>
                                        <Button variant="outline" size="sm" onClick={() => handleDownloadAllUploads(uploads)}>
                                            <DownloadCloud className="h-4 w-4 mr-2" />
                                            Download All
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-auto">
                                    <ul className="space-y-2">
                                        {uploads.map((upload) => (
                                            <li key={upload.id} className="flex items-center space-x-2">
                                                <Download className="h-4 w-4 text-gray-500 flex-shrink-0"
                                                    onClick={() => downloadFile(generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name))}
                                                />
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)}
                                                                className="text-blue-600 hover:underline truncate max-w-[200px]"
                                                                target={"_blank"}
                                                            >
                                                                {upload.file_name}
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Uploaded: {new Date(upload.uploaded_at).toLocaleString()}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
