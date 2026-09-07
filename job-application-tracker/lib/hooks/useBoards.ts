"use client";

import { useEffect, useState } from "react";
import { Board, Column } from "../Models/models.types";
import column from "../Models/column";

export function useBoards(initalBoard?: Board | null) {
    const [board, setBoard] = useState<Board | null>(initalBoard || null);
    const [columns, setColumns] = useState<Column[]>(initalBoard?.columns || []);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(initalBoard) {
            setBoard(initalBoard);
            setColumns(initalBoard.columns || []);
        }
    }, [initalBoard]);

    async function moveJob(jobApplicationId: string, newColumnId: string,newOrder: number){

    }

    return {board,columns,error,moveJob}
}


