"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/AUTH/auth";
import connectDB from "@/lib/db";
import { Board, Column, JobApplication } from "@/lib/Models";

interface JobApplicationPayload {
  title?: string;
  company: string;
  position: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobURL?: string;
  columnId: string;
  boardId: string;
  tags?: string[];
  description?: string;
}

export async function createJobApplication(data: { jobApplicationData: JobApplicationPayload }) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const {
    title,
    company,
    position,
    location,
    notes,
    salary,
    jobURL,
    columnId,
    boardId,
    tags,
    description,
  } = data.jobApplicationData;

  if (!company || !position || !columnId || !boardId) {
    return { error: "Missing required fields" };
  }

  const board = await Board.findOne({ _id: boardId, userId: session.user.id });
  if (!board) {
    return { error: "Board not found" };
  }

  const column = await Column.findOne({ _id: columnId, boardId });
  if (!column) {
    return { error: "Column not found" };
  }

  const maxOrderDoc = (await JobApplication.findOne({ columnId })
    .sort({ order: -1 })
    .select("order")
    .lean()) as { order: number } | null;

  const jobApplication = await JobApplication.create({
    title: title?.trim() || position,
    company,
    position,
    location,
    notes,
    salary,
    jobUrl: jobURL,
    columnId,
    boardId,
    userId: session.user.id,
    tags: tags ?? [],
    description,
    status: "applied",
    order: maxOrderDoc ? maxOrderDoc.order + 1 : 0,
  });

  await Column.findByIdAndUpdate(columnId, { $push: { jobApplicationId: jobApplication._id } });

  revalidatePath("/dashboard");

  return { data: JSON.parse(JSON.stringify(jobApplication)) };
}
