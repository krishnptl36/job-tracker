import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getSession } from "@/lib/AUTH/auth";
import connectDB from "@/lib/db";
import { Board } from "@/lib/Models";
import { initializeUserBoard } from "@/lib/init-user-board";
import KanbanBoard from "@/components/ui/kanban-board";

async function getBoard(userId: string) {
    // Do not use "use cache" here because this is user-specific data.
    await connectDB();

    await initializeUserBoard(userId);

    const boardDoc = await Board.findOne({
        userId,
        name: "Job Hunt",
    })
        .populate({
            path: "columns",
            populate: {
                path: "jobApplicationId",
            },
        })
        .lean();

    return boardDoc;
}

async function DashboardPage() {
    // Read the session outside any cached function.
    const session = await getSession();

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    const board = await getBoard(session.user.id);

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-black">
                        Job Hunt
                    </h1>

                    <p className="text-gray-600">
                        Track your job applications here.
                    </p>
                </div>

                <KanbanBoard
                    board={JSON.parse(JSON.stringify(board))}
                    userId={session.user.id}
                />
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<p className="p-6">Loading...</p>}>
            <DashboardPage />
        </Suspense>
    );
}