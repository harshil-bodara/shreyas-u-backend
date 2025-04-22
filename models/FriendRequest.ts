import { Schema, model } from "mongoose";
import { IFriendRequest } from "../types/types";

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    comment: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IFriendRequest>("FriendRequest", friendRequestSchema);
