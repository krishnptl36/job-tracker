"use client";

import type { JobApplication, Column } from "@/lib/Models/models.types";
import { Card, CardContent } from "./card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog";
import { Input } from "./input";
import Button from "./button";
import { Edit2, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-applications";

interface JobApplicationCardProps{
    job: JobApplication;
    columns: Column[];
}

const INITIAL_FORM_DATA = {
    company: "",
    position: "",
    location: "",
    notes: "",
    salary: "",
    jobURL: "",
    tags: "",
    description: "",
};

function getEditFormData(job: JobApplication) {
    return {
        company: job.company ?? "",
        position: job.position ?? job.title ?? "",
        location: job.location ?? "",
        notes: job.notes ?? "",
        salary: job.salary ?? "",
        jobURL: job.jobUrl ?? "",
        tags: Array.isArray(job.tags) ? job.tags.join(",") : "",
        description: job.description ?? "",
    };
}

export default function JobApplicationCard({job,columns}: JobApplicationCardProps){
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    

    const jobTitle = job.position ?? job.title ?? "Untitled Role";

    async function handleDelete(){
        

        try{
           const result = await deleteJobApplication(job._id);

              if ((result as { error?: string })?.error) {
                console.error("Failed to move job application:", (result as { error?: string }).error);
                return;
              }
           router.refresh();
        }catch (err){
            console.error("Failed to move job application: ",err)
        }
    }

    async function handleMove(newColumnId: string){
        if (!newColumnId || newColumnId === job.columnId) {
            return;
        }

        try{
           const result = await updateJobApplication(job._id, {
            columnId: newColumnId,
           });

              if ((result as { error?: string })?.error) {
                console.error("Failed to move job application:", (result as { error?: string }).error);
                return;
              }

           

           router.refresh();
        }catch (err){
            console.error("Failed to move job application: ",err)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const result = await updateJobApplication(job._id, {
                company: formData.company,
                position: formData.position,
                location: formData.location,
                notes: formData.notes,
                salary: formData.salary,
                jobURL: formData.jobURL,
                tags: formData.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                description: formData.description,
            });

            if ((result as { error?: string })?.error) {
                console.error("Failed to update job:", (result as { error?: string }).error);
                return;
            }

            setIsEditing(false);
            router.refresh();
        } catch (err) {
            console.error("Failed to update job:", err);
        }
    }

    return (
        <>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg bg-white group shadow-sm">
                <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{jobTitle}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{job.company}</p>
                        {job.salary ? (
                            <p className="text-xs text-muted-foreground mb-2">{job.salary}</p>
                        ) : null}
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {job.description}
                    </p>

                        <a href={job.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open job posting"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 text-black-600"
                        >
                            <ExternalLink className="h-4 w-4"  />
                        </a>


                    </div>
                    <div className="flex items-start gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger aria-label="Open menu" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100">
                                <MoreVertical className="h-5 w-5 text-black" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    setFormData(getEditFormData(job));
                                    setIsEditing(true);
                                }}
                            >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>

                                {columns.length >1 && (
                                    <>
                                    {columns
                                            .filter((c) => c._id !== job.columnId)
                                            .map((coulmn, key) => (
                                                <DropdownMenuItem key={key} onClick={() => handleMove(coulmn._id)}>
                                                    Move to {coulmn.name}
                                                </DropdownMenuItem>
                                            ))
                                    }
                                    </>
                                )}
                            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                </div>
                </CardContent>
            </Card>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Job Application</DialogTitle>
                        <DialogDescription>Update this job application</DialogDescription>

                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="company">Company *</label>
                            <Input id="company" required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="position">Position *</label>
                            <Input id="position" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}/>
                        </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                        <div className="space-y-2">
                            <label htmlFor="location">Location</label>
                            <Input id="location" className="h-10 px-3" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="salary">Salary</label>
                            <Input id="salary" className="h-10 px-3" required placeholder="e.g. 100K-250k" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})}/>
                        </div>
                        </div>
                        <div className="space-y-2">
                        <label htmlFor="jobURL">Job URL</label>
                        <Input id="jobURL" placeholder="https://...." value={formData.jobURL} onChange={(e) => setFormData({...formData, jobURL: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                        <label htmlFor="tags">Tags</label>
                        <Input id="tags" placeholder="React,Tailwind,High Pay" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                        <label htmlFor="descirption">Description</label>
                        <Input id="description" placeholder="Description of the job" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                        <label htmlFor="notes">Notes</label>
                        <Input id="notes"  value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}/>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" className="border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}