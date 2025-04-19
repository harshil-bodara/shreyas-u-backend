import { Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profile?: Record<string, any>;
  connections: number;
  followingCompanies: Types.ObjectId[];
}

export interface IFriendRequest extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  requestedAt: Date;
  acceptedAt?: Date;
}

export interface ICompany extends Document {
  name: string;
  description: string;
  logo: string;
  tags: string[];
  followers: Types.ObjectId[];
}
