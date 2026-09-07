"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "./dialog";
import { DialogDescription, DialogTitle } from "./dialog";
import { Input } from "./input";
import { Plus } from "lucide-react";
import Button from "./button";
import { useState } from "react";
import { createJobApplication } from "@/app/actions/job-applications";
import { useRouter } from "next/navigation";


interface CreateJobApplicationDialogProps {
  columnId: string;
  boardId: string;
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

}

export default function CreateJobApplicationDialog({columnId, boardId}: CreateJobApplicationDialogProps) {
  const [open,setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [formData, setFormData] = useState(
    INITIAL_FORM_DATA,
  );
async function handleSubmit(e: React.FormEvent){
  e.preventDefault()

  if (!columnId) {
    return;
  }

  try{
      const result = await createJobApplication({
        jobApplicationData: {
          ...formData,
          columnId,
          boardId,
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        },
      });
      if(!result.error){
        setFormData(INITIAL_FORM_DATA)
        setOpen(false);
        router.refresh();
      }
      else{
        console.error("Failed to create job: ", result.error)
      }
  }catch(err){
    console.error(err);
  }
}

    return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger className="mb-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
    <Plus className="h-4 w-4" />
            Add Job
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job Apllication</DialogTitle>
          <DialogDescription>Track a new job application</DialogDescription>

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
              <Button type="button" variant="ghost" className="border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    )
}