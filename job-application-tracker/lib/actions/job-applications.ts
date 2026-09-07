"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../AUTH/auth";
import connectDB from "../db";
import { Board, Column, JobApplication } from "../Models";

interface JobApplication {
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

export async function createJobApplication(data: { jobApplicationData: JobApplication }) {
    const session = await getSession();
    if (!session) {
        return { error: "Unauthorized"};
    }

    await connectDB();

    const {
    company, position, location, notes, salary, jobURL, columnId, boardId, tags, description } = data.jobApplicationData;

    if (!company || !position || !columnId || !boardId) {
        return { error: "Missing required fields" };
    }

    // Verify board ownership 
    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
        return { error: "Board not found" };
    }

    //verify column belomg to board

    const column = await Column.findOne({ _id: columnId, boardId: boardId });
    if (!column) {
        return { error: "Column not found" };
    }

    const maxOrder = (await JobApplication.findOne({ columnId }).sort({ order: -1 }).select("order").lean() as {order: number} || null);

    const jobApplication = await JobApplication.create({
        company,
        position,
        location,
        notes,
        salary,
        jobUrl: jobURL,
        columnId,
        boardId,
        userId: session.user.id,
        tags: tags || [],
        description,
        status: "applied",
        order: maxOrder ? maxOrder.order + 1 : 0,
    })

    await Column.findByIdAndUpdate(columnId, { $push: { jobApplicationId: jobApplication._id } });

    revalidatePath("/dashboard");

    return {data: JSON.parse(JSON.stringify(jobApplication))};
}

export async function updateJobApplication(
    id:string,
    updates: {
        company?: string;
        position?: string;
        location?: string;
        notes?: string;
        salary?: string;
        jobURL?: string;
        columnId?: string;
        boardId?: string;
        tags?: string[];
        description?: string;
        order?: number;
        
    }

) {
    const session = await getSession();
    if (!session?.user) {
        return { error: "Unauthorized"};
    }

    await connectDB();

    const jobApplication = await JobApplication.findById(id);

    if (!jobApplication) {
        return { error: "Job application not found" };
    }

    if(jobApplication.userId.toString() !== session.user.id) {
        return { error: "Unauthorized" };
    }

    const { columnId, order, jobURL, ...otherUpdates } = updates;

    const updatesToApply: Partial<{
        company: string;
        position: string;
        location: string;
        notes: string;
        salary: string;
        jobUrl: string;
        columnId: string;
        boardId: string;
        tags: string[];
        description: string;
        order: number;
    }> = { ...otherUpdates };

    if (jobURL !== undefined) {
        updatesToApply.jobUrl = jobURL;
    }

    const currentColumnId = jobApplication.columnId.toString();
    const newColumnId = columnId?.toString();

    const isMovingToDifferentColumn = newColumnId && newColumnId !== currentColumnId;

    if (isMovingToDifferentColumn) {
        const jobId = jobApplication._id;

        // Remove stale references from every other column on this board.
        await Column.updateMany(
            {
                boardId: jobApplication.boardId,
                _id: { $ne: newColumnId },
            },
            { $pull: { jobApplicationId: jobId } }
        );
    

        const jobsInTargetColumn = await JobApplication.find({
            columnId: newColumnId,
            _id: { $ne: id },
        })
            .sort({ order: 1 })
            .lean();

        let newOrderValue: number;

        if (order !== undefined && order !== null) {
            newOrderValue = order * 100;
            const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
            for (const job of jobsThatNeedToShift) {
                 await JobApplication.findByIdAndUpdate(job._id, { $set: { order: (job.order ?? 0) + 100 } });
            }
        } else {
            if (jobsInTargetColumn.length > 0) {
                const lastJobOrder = jobsInTargetColumn[jobsInTargetColumn.length - 1].order || 0;
                 newOrderValue = lastJobOrder + 100;
            } else {
                newOrderValue = 0;
            }

        }

        updatesToApply.columnId = newColumnId;
        updatesToApply.order = newOrderValue;

        await Column.findByIdAndUpdate(newColumnId, { $addToSet: { jobApplicationId: jobId } });
    } else if (order !== undefined && order !== null) {
        const otherJobsInColumn = await JobApplication.find({
          columnId: currentColumnId,
          _id: { $ne: id },
        })
            .sort({ order: 1 })
            .lean();

        const currentJobOrder = jobApplication.order || 0;
        const currentPositionIndex = otherJobsInColumn.findIndex((job) => job.order > currentJobOrder);

        const oldPositionIndex = currentPositionIndex === -1 ? otherJobsInColumn.length : currentPositionIndex;
        const newOrderValue = order * 100;

        if(order<oldPositionIndex){
            const jobsToShiftDown = otherJobsInColumn.slice(order, oldPositionIndex);
            for (const job of jobsToShiftDown) {
                await JobApplication.findByIdAndUpdate(job._id, { $set: { order: job.order + 100 } });
            }
        }else if(order>oldPositionIndex){
            const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);
            for (const job of jobsToShiftUp) {
                const newOrder = Math.max(0, job.order - 100);
                await JobApplication.findByIdAndUpdate(job._id, { $set: { order: newOrder } });
            }
        }
        updatesToApply.order = newOrderValue;
    }

    const updated = await JobApplication.findByIdAndUpdate(id, updatesToApply , { new: true });

    revalidatePath("/dashboard");

    return  {data: JSON.parse(JSON.stringify(updated))}

    
}

export async function deleteJobApplication(id: string) {
    const session = await getSession();
    if(!session?.user?.id){
        return { error: "User not authenticated" };
    }

    const jobApplication = await JobApplication.findById(id);

    if (!jobApplication) {
        return { error: "Job application not found" };
    }

    if (jobApplication.userId !== session.user.id) {
        return { error: "Unauthorized" };
    }

    await Column.findByIdAndUpdate(jobApplication.columnId, {
        $pull: { jobApplicationId: id },
    });

    await JobApplication.deleteOne({ _id: id });
    revalidatePath("/dashboard");

    return { success: true };
}

export async function deleteColumn(id: string) {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: "User not authenticated" };
    }

    await connectDB();

    const column = await Column.findById(id);
    if (!column) {
        return { error: "Column not found" };
    }

    const board = await Board.findOne({
        _id: column.boardId,
        userId: session.user.id,
    });

    if (!board) {
        return { error: "Unauthorized" };
    }

    await JobApplication.deleteMany({ columnId: column._id });

    await Board.findByIdAndUpdate(board._id, {
        $pull: { columns: column._id },
    });

    await Column.deleteOne({ _id: column._id });

    revalidatePath("/dashboard");

    return { success: true };
}

export async function createColumn(data: { boardId: string; name: string }) {
    const session = await getSession();
    if (!session?.user?.id) {
        return { error: "User not authenticated" };
    }

    await connectDB();

    const boardId = data.boardId?.trim();
    const name = data.name?.trim();

    if (!boardId || !name) {
        return { error: "Board ID and column name are required" };
    }

    const board = await Board.findOne({ _id: boardId, userId: session.user.id });
    if (!board) {
        return { error: "Board not found" };
    }

    const maxOrderDoc = (await Column.findOne({ boardId })
        .sort({ order: -1 })
        .select("order")
        .lean()) as { order: number } | null;

    const column = await Column.create({
        name,
        boardId,
        order: maxOrderDoc ? maxOrderDoc.order + 1 : 0,
        jobApplicationId: [],
    });

    await Board.findByIdAndUpdate(board._id, {
        $push: { columns: column._id },
    });

    revalidatePath("/dashboard");

    return { data: JSON.parse(JSON.stringify(column)) };
}

