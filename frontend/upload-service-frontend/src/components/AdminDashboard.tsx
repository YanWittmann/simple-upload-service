import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { ProjectList } from './ProjectList';
import { UploadsList } from './UploadsList';
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";

export function AdminDashboard() {
  const [newProjectName, setNewProjectName] = useState('');
  const { fetchData, isLoading, error } = useApi();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      await fetchData('createProject', {}, { name: newProjectName });
      setNewProjectName('');
      // Refresh project list
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div>
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleCreateProject} className="flex gap-4">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
          />
          <Button type="submit">Create Project</Button>
        </form>
      </div>
      <ProjectList />
      <UploadsList />
    </div>
  );
}

