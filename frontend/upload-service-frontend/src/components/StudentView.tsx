import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { FileUploader } from './FileUploader';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@shadcn/components/ui/select";
import { Input } from "@shadcn/components/ui/input";

interface Project {
  id: number;
  name: string;
}

export function StudentView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const { fetchData, isLoading, error } = useApi<Project[]>();

  useEffect(() => {
    fetchData('getProjects')
      .then((data) => setProjects(data))
      .catch((error) => console.error('Failed to fetch projects:', error));
  }, []);

  const handleSubmit = async (files: File[]) => {
    if (!selectedProject || !studentName || files.length === 0) {
      alert('Please fill in all fields and select at least one file.');
      return;
    }

    const formData = new FormData();
    formData.append('project_id', selectedProject);
    formData.append('student_name', studentName);
    files.forEach((file) => formData.append('files[]', file));

    try {
      await fetchData('uploadFiles', {}, formData);
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Student Project Uploader</h1>
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
      <Input
        placeholder="Enter your name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <FileUploader onSubmit={handleSubmit} />
    </div>
  );
}

