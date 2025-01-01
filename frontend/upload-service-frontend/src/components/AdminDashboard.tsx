import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ProjectList } from './ProjectList';
import { UploadsList } from './UploadsList';
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@shadcn/components/ui/card";

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

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
      <div className="space-y-8 max-w-7xl mx-auto mt-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="flex gap-4">
              <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="flex-grow"
              />
              <Button type="submit">Create Project</Button>
            </form>
          </CardContent>
        </Card>
        <ProjectList />
        <UploadsList />
      </div>
  );
}
