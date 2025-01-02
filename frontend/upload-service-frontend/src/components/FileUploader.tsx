import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@shadcn/components/ui/button";

interface FileUploaderProps {
    onSubmit: (files: File[]) => void;
}

export function FileUploader({ onSubmit }: FileUploaderProps) {
    const [files, setFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(files);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drop files here, or click to select files</p>
                )}
            </div>
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

