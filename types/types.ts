import { Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  coverImage?: Record<string, any>;
  connections: number;
  followingCompanies: Types.ObjectId[];
  designation:string,
  city:string
}

export interface IFriendRequest extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  comment:string,
  status: "pending" | "accepted" | "rejected";
  requestedAt: Date;
  acceptedAt?: Date;
}

export interface ICompany extends Document {
  name: string;
  description: string;
  coverImage: string;
  tags: string[];
  followers: Types.ObjectId[];
}
