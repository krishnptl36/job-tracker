import { auth } from "@/lib/AUTH/auth";
import { initializeUserBoard } from "@/lib/init-user-board";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const board = await initializeUserBoard(session.user.id);
    return NextResponse.json({ board });
}
