'use client'

import React, { useEffect, useState } from 'react'
import { generateDownloadUrl, useApi } from "../hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { Button } from "@shadcn/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { Download, DownloadCloud, Image, List } from 'lucide-react';
import JSZip from "jszip";
import { Project } from "./ProjectList";

interface Upload {
    id: number
    student_name: string
    project_id: number
    file_path: string
    file_name: string
    uploaded_at: string
}

interface GroupedUploads {
    [studentName: string]: Upload[]
}

interface UploadsListProps {
    selectedProject: Project | null
}

type FileDisplayMode = 'list' | 'preview'

export function UploadsList(
    { selectedProject }: UploadsListProps
) {
    const [groupedUploads, setGroupedUploads] = useState<GroupedUploads>({})
    const { fetchData, isLoading, error } = useApi<Upload[]>()
    const [fileDisplayMode, setFileDisplayMode] = useState<FileDisplayMode>('list')

    useEffect(() => {
        if (selectedProject) {
            fetchUploads(selectedProject)
        }
    }, [selectedProject])

    function cleanFilename(filename: string) {
        return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    }

    const fetchUploads = async (project: Project) => {
        try {
            const data = await fetchData('getUploads', { project_id: project.id.toString() })
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
            a.download = cleanFilename(selectedProject?.name ?? "project") + "_" + cleanFilename(uploads[0].student_name) + '.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    const handleDownloadAllProjectUploads = async () => {
        const allUploads = Object.values(groupedUploads).flat();
        const sortedUploads = allUploads.sort((a, b) => a.student_name.localeCompare(b.student_name));

        // like above but with a folder per student
        const zip = new JSZip();
        for (const upload of sortedUploads) {
            try {
                const response = await fetch(generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name));
                if (!response.ok) {
                    throw new Error('Failed to download file');
                }
                const blob = await response.blob();
                zip.folder(upload.student_name)?.file(upload.file_name, blob);
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
            a.download = cleanFilename(selectedProject?.name ?? "project") + '.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    if (isLoading) return <div className="text-center">Loading uploads...</div>
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>

    function renderFileDisplay(uploads: Upload[]) {
        if (fileDisplayMode === 'list') {
            return (
                <ul className="space-y-2">
                    {uploads.map((upload) => (
                        <li key={upload.id} className="flex items-center space-x-2">
                            <TooltipProvider delayDuration={400} disableHoverableContent={true}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Download className="h-4 w-4 text-gray-500 flex-shrink-0 cursor-pointer"
                                                  onClick={() => downloadFile(generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name))}/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Click to download file
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)}
                                            className="text-blue-600 hover:underline truncate"
                                            target={"_blank"}>
                                            {upload.file_name}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{new Date(upload.uploaded_at).toLocaleString()}</p>
                                        {upload.file_name.match(/\.(jpeg|jpg|gif|png)$/) && (
                                            <img
                                                src={generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)}
                                                alt={upload.file_name}
                                                className="mt-2 max-w-xs rounded"/>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </li>
                    ))}
                </ul>
            )
        } else if (fileDisplayMode === 'preview') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                    {uploads.map((upload) => (
                        <div key={upload.id} className="flex flex-col">
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <a href={generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)}
                                           target={"_blank"}>
                                            <img
                                                src={generateDownloadUrl(upload.project_id, upload.student_name, upload.file_name)}
                                                alt={upload.file_name}
                                                className="max-w-full h-auto"/>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{new Date(upload.uploaded_at).toLocaleString()}</p>
                                        <p>{upload.file_name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}
                </div>
            )
        }

        return <><span>Please select a valid file display mode</span></>
    }

    return (
        <Card>
            <CardHeader className="pt-5 pb-1">
                <CardTitle>
                    {selectedProject ? `Uploads for ${selectedProject.name}` : 'Uploads'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!selectedProject && <p className="text-center">Click on a project above to view uploads.</p>}
                {selectedProject && (
                    <div className="space-y-4">
                        <Button variant="outline" size="sm" className="mr-2" onClick={handleDownloadAllProjectUploads}>
                            <DownloadCloud className="h-4 w-4 mr-2"/>
                            Download All for Project
                        </Button>
                        {fileDisplayMode === 'preview' && (
                            <Button variant="outline" size="sm" className="mr-2"
                                    onClick={() => setFileDisplayMode('list')}>
                                <List className="h-4 w-4 mr-2"/>
                                List
                            </Button>
                        )}
                        {fileDisplayMode === 'list' && (
                            <Button variant="outline" size="sm" className="mr-2"
                                    onClick={() => setFileDisplayMode('preview')}>
                                <Image className="h-4 w-4 mr-2"/>
                                Preview
                            </Button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {Object.entries(groupedUploads).map(([studentName, uploads]) => (
                                <Card key={studentName} className="flex flex-col">
                                    <CardHeader className={"py-3 px-6"}>
                                        <div className="flex justify-between items-center">
                                            <CardTitle>{studentName}</CardTitle>
                                            <Button variant="outline" size="sm"
                                                    onClick={() => handleDownloadAllUploads(uploads)}>
                                                <DownloadCloud className="h-4 w-4 mr-2"/>
                                                Download All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow overflow-auto">
                                        {renderFileDisplay(uploads)}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

