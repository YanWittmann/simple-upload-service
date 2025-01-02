import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Project, ProjectList } from './ProjectList';
import { UploadsList } from './UploadsList';
import { Button } from "@shadcn/components/ui/button";

export function AdminDashboard() {
    const [newProjectName, setNewProjectName] = useState('');
    const { fetchData, isLoading, error } = useApi();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName) return;

        try {
            await fetchData('createProject', {}, { name: newProjectName });
            setNewProjectName('');
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    const handleProjectClicked = (project: Project | null) => {
        setSelectedProject(project);
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto mt-1 px-4">
            <ProjectList onProjectClick={handleProjectClicked}/>
            <UploadsList selectedProject={selectedProject}/>

            <Button onClick={() => {
                localStorage.removeItem('adminAuthenticated');
                localStorage.removeItem('adminPassword');
                window.location.reload();
            }}>Logout</Button>
        </div>
    );
}
