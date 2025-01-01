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
            <Input type="file" multiple onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
            <div className="text-sm text-gray-500">
                {files.map((file, index) => (
                    <div key={index}>{file.name}</div>
                ))}
            </div>
            <Button type="submit" disabled={files.length === 0} className="w-full">
                Upload Files
            </Button>
        </form>
    );
}

