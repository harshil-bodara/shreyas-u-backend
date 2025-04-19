import { Schema, model } from "mongoose";
import { IUser } from "../types/types";

const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    password: String,
    profile: String,
    connections: {
      type: Number,
      default: 0,
    },
    followingCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
