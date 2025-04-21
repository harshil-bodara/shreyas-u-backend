import { Schema, model } from "mongoose";
import { IUser } from "../types/types";

const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    password: String,
    coverImage: String,
    connections: {
      type: Number,
      default: 0,
    },
    designation:String,
    city:String,
    followingCompanies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
