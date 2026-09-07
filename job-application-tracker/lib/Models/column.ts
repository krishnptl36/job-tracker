

import mongoose,{Schema, Document} from "mongoose";

export interface IColumn extends Document {
    name: string;
    boardId: mongoose.Types.ObjectId;
    order: number;
    jobApplicationId: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;

}

const columnSchema = new Schema<IColumn>({
    name:{
        type: String,
        required: true,
        index: true,
    },
    boardId:{
        type: mongoose.Types.ObjectId,
        required: true,
        index: true,
        ref: "Board",
    },
    order:{
        type: Number,
        required: true,
        default: 0,
    },
    jobApplicationId: [
        {
            type: mongoose.Types.ObjectId,
            ref: "JobApplication",
        },
    ],
},
{
    timestamps: true,
}
);

export default mongoose.models.Column || mongoose.model<IColumn>("Column",columnSchema);