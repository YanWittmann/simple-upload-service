import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shadcn/components/ui/dialog"
import { Button } from "@shadcn/components/ui/button"
import { Project } from './ProjectList'
import { createShareUrl } from "../hooks/useApi";

interface ShareProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: Project | null
}

export function ShareProjectModal({ isOpen, onClose, project }: ShareProjectModalProps) {
    const [shareUrl, setShareUrl] = useState<string>('')

    useEffect(() => {
        if (project) {
            setShareUrl(createShareUrl(project.id))
        }
    }, [project])

    if (!project) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Project: {project.name}</DialogTitle>
                </DialogHeader>
                {shareUrl}
                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
