import User from "../models/User";
import bcrypt from "bcryptjs";
import { jwtToken } from "../utils/jwtTokenHandler";
import FriendRequest from "../models/FriendRequest";
import { Types } from "mongoose";
import UserIgnore from "../models/UserIgnore";

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = await jwtToken({
    id: user._id,
    email: user.email,
  });

  return {
    message: "Login successful",
    token,
  };
};

export const getUsersForInvitation = async (userId: string) => {
  try {
    const allUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const connectedUsers = await FriendRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    });

    const connectedUserIds = connectedUsers.map((request) =>
      request.sender.toString() === userId
        ? new Types.ObjectId(request.receiver)
        : new Types.ObjectId(request.sender)
    );

    const ignoredEntries = await UserIgnore.find({ userId });
    const ignoredUserIds = ignoredEntries
      .map((entry) => entry.ignoredUserId)
      .filter((ignoredUserId) => ignoredUserId != null)
      .map((ignoredUserId) => new Types.ObjectId(ignoredUserId));

    const usersToInvite = allUsers.filter(
      (user) =>
        !connectedUserIds.some((connectedUserId) =>
          connectedUserId.equals(user._id)
        ) &&
        !ignoredUserIds.some((ignoredUserId) => ignoredUserId.equals(user._id))
    );

    return usersToInvite;
  } catch (error) {
    throw new Error("Error fetching users for invitation");
  }
};

export const getConnections = async (userId: string) => {
  try {
    const acceptedRequests = (await FriendRequest.find({
      sender: userId,
      status: "accepted",
    }).populate("receiver", "username email")) as unknown as {
      sender: Types.ObjectId;
      receiver: {
        _id: Types.ObjectId;
        username: string;
        email: string;
      };
      status: string;
    }[];

    const userConnections = acceptedRequests.map((request) => ({
      _id: request.receiver._id,
      username: request.receiver.username,
      email: request.receiver.email,
      type: "user",
    }));

    const user = await User.findById(userId).populate({
      path: "followingCompanies",
      select: "name description logo tags followers",
    });

    const followedCompanies = (user?.followingCompanies || []).map((company: any) => ({
      _id: company._id,
      name: company.name,
      description: company.description,
      logo: company.logo,
      tags: company.tags,
      connectionCount: company.followers?.length || 0,
      type: "company",
    }));

    const combinedConnections = [...userConnections, ...followedCompanies];

    if (combinedConnections.length === 0) {
      throw new Error("No connections found");
    }

    return combinedConnections;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const withdrawConnection = async (
  userId: string,
  targetUserId: string
) => {
  try {
    const request = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: userId, receiver: targetUserId, status: "accepted" },
        { sender: targetUserId, receiver: userId, status: "accepted" },
      ],
    });

    if (!request) {
      throw new Error("No accepted connection found to withdraw");
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, { $inc: { connections: -1 } }),
      User.findByIdAndUpdate(targetUserId, { $inc: { connections: -1 } }),
    ]);

    return {
      message: "Connection withdrawn successfully",
      connectionRemoved: true,
      targetUserId,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to withdraw connection");
  }
};
