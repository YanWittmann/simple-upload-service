import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { FileUploader } from './FileUploader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shadcn/components/ui/select";
import { Input } from "@shadcn/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";
import { cn } from "@shadcn/lib/utils";
import { useToast } from "@shadcn/hooks/use-toast";

interface Project {
    id: number;
    name: string;
}

const LoadingSpinner = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
};

export function StudentView() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [studentName, setStudentName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { fetchData, isLoading, error } = useApi<Project[]>();
    const { toast } = useToast();

    useEffect(() => {
        fetchData('getProjects')
            .then((data) => setProjects(data))
            .catch((error) => setErrorMessage('Failed to fetch projects.'));
    }, []);

    const handleSubmit = async (files: File[]) => {
        if (!selectedProject) {
            setErrorMessage('Please select a project.');
            return;
        } else if (!studentName) {
            setErrorMessage('Please enter your name.');
            return;
        } else if (files.length === 0) {
            setErrorMessage('Please select at least one file.');
            return;
        }

        const formData = new FormData();
        formData.append('project_id', selectedProject);
        formData.append('student_name', studentName);
        files.forEach((file) => formData.append('files[]', file));

        try {
            await fetchData('uploadFiles', {}, formData);
            setErrorMessage(null);
            toast({
                title: 'Files uploaded successfully!',
                description: 'Your files have been uploaded successfully.',
                variant: 'success'
            })
        } catch (error) {
            setErrorMessage('Failed to upload files. Please try again.');
            toast({
                title: 'Failed to upload files',
                description: 'An error occurred while uploading your files. Please try again.',
                variant: 'destructive'
            })
        }
    };

    if (isLoading) return (<div className="flex justify-center items-center h-screen">
        <LoadingSpinner className="h-12 w-12 text-blue-500"/>
    </div>);

    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a project"/>
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                />
                <FileUploader onSubmit={handleSubmit}/>
                {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            </CardContent>
        </Card>
    );
}
