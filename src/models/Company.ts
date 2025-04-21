import { Schema, model } from "mongoose";
import { ICompany } from "../types/types";

const companySchema = new Schema<ICompany>(
  {
    name: String,
    description: String,
    coverImage: String,
    tags: [String],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default model<ICompany>("Company", companySchema);
