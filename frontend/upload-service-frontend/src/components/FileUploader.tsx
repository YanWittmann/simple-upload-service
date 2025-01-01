import React, { useState } from 'react';
import { Input } from "@shadcn/components/ui/input";
import { Button } from "@shadcn/components/ui/button";

interface FileUploaderProps {
  onSubmit: (files: File[]) => void;
}

export function FileUploader({ onSubmit }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input type="file" multiple onChange={handleFileChange} />
      <div>
        {files.map((file, index) => (
          <div key={index}>{file.name}</div>
        ))}
      </div>
      <Button type="submit" disabled={files.length === 0}>
        Upload Files
      </Button>
    </form>
  );
}

