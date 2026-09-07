
"use client";
import type { ReactNode } from "react";
import type { Board, Column, JobApplication } from "@/lib/Models/models.types";
import { Award, Calendar, CheckCircle2, Mic, MoreVertical, Plus, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "./dropdown-menu";
import CreateJobApplicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";
import { createColumn, deleteColumn } from "@/lib/actions/job-applications";

interface KanbanBoardProps{
    board: Board | null;
    userId: string;

}

interface ColConfig{
    color: string;
    icon: ReactNode;
}

const COLUMN_CONFIG: Array<ColConfig> = [
    {
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];

function DroppableColumn({ column, config, boardId, sortedColumns }: { column: Column; config: ColConfig; boardId: string; sortedColumns: Column[] }) {
    const router = useRouter();

    async function handleDeleteColumn() {
        if (!confirm(`Delete column "${column.name}" and all jobs in it?`)) {
            return;
        }

        const result = await deleteColumn(column._id);
        if ((result as { error?: string })?.error) {
            console.error("Failed to delete column:", (result as { error?: string }).error);
            return;
        }

        router.refresh();
    }

    const sortedJobs = [...(column.jobApplicationId ?? [])]
        .filter((job) => !job.columnId || String(job.columnId) === String(column._id))
        .sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    return (
        <Card className="min-w-[240px] flex-shrink-0">
            <CardHeader className={`${config.color}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {config.icon}
                        <CardTitle className="text-white text-sm font-semibold">{column.name}</CardTitle>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-white/20 cursor-pointer inline-flex items-center justify-center">
                            <MoreVertical className="h-4 w-4 text-white" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={handleDeleteColumn}>
                                    <Trash2 />
                                    Delete Column
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="bg-gray-50/70 min-h-[400px] rounded-b-lg pt-4">
                {sortedJobs.map((job) => (
                    <SortableJobCard key={job._id} job={{ ...job, columnId: job.columnId || column._id }} columns={sortedColumns}
                    />
                    
                ))}
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
                    <CreateJobApplicationDialog columnId={column._id} boardId={boardId} />
                </div>
            </CardContent>
        </Card>
    );
}

function SortableJobCard({ job, columns }: { job: JobApplication; columns: Column[] }) {


    return <div><JobApplicationCard job={job} columns={columns} /></div>
}

export default function KanbanBoard({board}: KanbanBoardProps) {
    const router = useRouter();

    async function handleAddColumn() {
        if (!board?._id) return;

        const name = prompt("Enter new column name:");
        if (!name || !name.trim()) {
            return;
        }

        const result = await createColumn({
            boardId: board._id,
            name: name.trim(),
        });

        if ((result as { error?: string })?.error) {
            console.error("Failed to create column:", (result as { error?: string }).error);
            return;
        }

        router.refresh();
    }
    
    if (!board) {
        return (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No board found. Please refresh the page.</p>
            </div>
        );
    }
    const columns = board.columns ?? [];

    // const {columns,moveJob} = useBoard(board);

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    if (columns.length === 0) {
        return (
            <div className="overflow-x-auto w-full">
                <div className="min-w-[280px] max-w-sm">
                    <Card>
                        <CardHeader className="bg-gray-700">
                            <CardTitle className="text-white text-sm font-semibold">No columns yet</CardTitle>
                        </CardHeader>
                        <CardContent className="bg-gray-50/70 min-h-[220px] rounded-b-lg pt-4">
                            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
                                <p className="text-sm text-gray-600">
                                    No columns are available yet. Refresh the page to re-initialize your board.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleAddColumn}
                                    className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Column
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto w-full">
            <div className="mb-3">
                <button
                    type="button"
                    onClick={handleAddColumn}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                    <Plus className="h-4 w-4" />
                    Add Column
                </button>
            </div>
            <div className="flex gap-4 pb-4 w-max min-w-full">
                    {sortedColumns.map((col, key) => {
                        const config = COLUMN_CONFIG[key] || {
                            color: "bg-gray-500",
                            icon: <Calendar className="h-4 w-4" />,
                        };
                        return (<DroppableColumn key={col._id} column={col} config={config} boardId={board._id} sortedColumns={sortedColumns} />);
                    })}
            </div>
        </div>
    );
}

function useBoard(board: Board): { columns: any; moveJob: any; } {
    throw new Error("Function not implemented.");
}
