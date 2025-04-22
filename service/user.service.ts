import User from "../models/User";
import bcrypt from "bcryptjs";
import { jwtToken } from "../utils/jwtTokenHandler";
import FriendRequest from "../models/FriendRequest";
import { Types } from "mongoose";
import UserIgnore from "../models/UserIgnore";
import Company from "../models/Company";

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
    const allUsersPromise = User.find({ _id: { $ne: userId } }).select("-password");

    const friendRequestsPromise = FriendRequest.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      status: { $in: ["accepted", "pending"] }
    });

    const ignoredEntriesPromise = UserIgnore.find({ userId });

    const [allUsers, friendRequests, ignoredEntries] = await Promise.all([
      allUsersPromise,
      friendRequestsPromise,
      ignoredEntriesPromise
    ]);

    const ignoredUserIds = new Set<string>(
      ignoredEntries
        .map(entry => entry.ignoredUserId)
        .filter((id): id is Types.ObjectId => id != null && typeof id === "object" && typeof id.toString === "function")
        .map(id => id.toString())
    );

    const friendRequestMap: Record<string, { status: string; comment: string | null }> = {};

    for (const req of friendRequests) {
      const otherUserId = req.sender.toString() === userId ? req.receiver.toString() : req.sender.toString();
      friendRequestMap[otherUserId] = {
        status: req.status,
        comment: req.comment || null,
      };
    }

    const usersWithStatus = allUsers
    .filter(user => {
      const userIdStr = user._id.toString();
      const requestInfo = friendRequestMap[userIdStr];
      const isIgnored = ignoredUserIds.has(userIdStr);
      const isAlreadyFriend = requestInfo?.status === "accepted";
      return !isIgnored && !isAlreadyFriend;
    })
      .map(user => {
        const userIdStr = user._id.toString();
        const requestInfo = friendRequestMap[userIdStr] || null;
        return {
          ...user.toObject(),
          comment: requestInfo?.comment || null,
        };
      });

    return usersWithStatus;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching users for invitation");
  }
};

export const getConnections = async (userId: string) => {
  try {
    // Sent pending requests
    const sentPendingRequests = (await FriendRequest.find({
      sender: userId,
      status: "pending",
    }).populate("receiver", "username email city designation coverImage")) as unknown as {
      receiver: {
        _id: Types.ObjectId;
        username: string;
        email: string;
        city: string;
        designation: string;
        coverImage: string;
      };
      status: string;
    }[];

    // Received pending requests
    const receivedPendingRequests = (await FriendRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "username email city designation coverImage")) as unknown as {
      sender: {
        _id: Types.ObjectId;
        username: string;
        email: string;
        city: string;
        designation: string;
        coverImage: string;
      };
      status: string;
    }[];

    const userConnections = [
      ...sentPendingRequests
        .map((request) => {
          if (request.receiver) {  // Check if receiver is not null
            return {
              _id: request.receiver._id,
              username: request.receiver.username,
              email: request.receiver.email,
              city: request.receiver.city,
              designation: request.receiver.designation,
              coverImage: request.receiver.coverImage,
              type: "user",
              direction: "sent",
            };
          }
          return null;  // Return null if receiver is null
        })
        .filter((data) => data !== null),  // Filter out null values
      ...receivedPendingRequests
        .map((request) => {
          if (request.sender) {  // Check if sender is not null
            return {
              _id: request.sender._id,
              username: request.sender.username,
              email: request.sender.email,
              city: request.sender.city,
              designation: request.sender.designation,
              coverImage: request.sender.coverImage,
              type: "user",
              direction: "received",
            };
          }
          return null;  // Return null if sender is null
        })
        .filter((data) => data !== null),  // Filter out null values
    ];

    // Followed companies
    const user = await User.findById(userId).populate({
      path: "followingCompanies",
      select: "name description coverImage tags followers",
    });

    const followedCompanies = (user?.followingCompanies || []).map((company: any) => ({
      _id: company._id,
      name: company.name,
      description: company.description,
      coverImage: company.coverImage,
      tags: company.tags,
      connectionCount: company.followers?.length || 0,
      type: "company",
    }));

    const combinedConnections = [...userConnections, ...followedCompanies];


    return combinedConnections;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getMyConnections = async (userId: string) => {
  try {
    // Friend requests the user sent and were accepted
    const sentAcceptedRequests = (await FriendRequest.find({
      sender: userId,
      status: "accepted",
    }).populate("receiver", "username email city designation coverImage")) as unknown as {
      receiver: {
        _id: Types.ObjectId;
        username: string;
        email: string;
        city: string;
        designation: string;
        coverImage: string;
      };
      status: string;
      comment: string;
    }[];

    // Friend requests the user received and were accepted
    const receivedAcceptedRequests = (await FriendRequest.find({
      receiver: userId,
      status: "accepted",
    }).populate("sender", "username email city designation coverImage")) as unknown as {
      sender: {
        _id: Types.ObjectId;
        username: string;
        email: string;
        city: string;
        designation: string;
        coverImage: string;
      };
      status: string;
      comment: string;
    }[];

    // Combine both directions into a single list
    const userConnections = [
      ...sentAcceptedRequests.map((request) => ({
        _id: request.receiver._id,
        username: request.receiver.username,
        email: request.receiver.email,
        city: request.receiver.city,
        designation: request.receiver.designation,
        coverImage: request.receiver.coverImage,
        comment: request.comment || null,
        type: "user",
      })),
      ...receivedAcceptedRequests.map((request) => ({
        _id: request.sender._id,
        username: request.sender.username,
        email: request.sender.email,
        city: request.sender.city,
        designation: request.sender.designation,
        coverImage: request.sender.coverImage,
        comment: request.comment || null,
        type: "user",
      })),
    ];

    // Companies the user follows
    const user = await User.findById(userId).populate({
      path: "followingCompanies",
      select: "name description coverImage tags followers",
    });

    const followedCompanies = (user?.followingCompanies || []).map((company: any) => ({
      _id: company._id,
      name: company.name,
      description: company.description,
      coverImage: company.coverImage,
      tags: company.tags,
      connectionCount: company.followers?.length || 0,
      type: "company",
    }));

    // Combine both user and company connections
    const combinedConnections = [...userConnections, ...followedCompanies];

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
    // 1. Check if target is a company
    const company = await Company.findById(targetUserId);

    if (company) {
      // 2. If it's a company, unfollow logic
      await Promise.all([
        Company.findByIdAndUpdate(targetUserId, {
          $pull: { followers: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { followingCompanies: targetUserId },
        }),
      ]);

      return {
        message: "Unfollowed company successfully",
        connectionRemoved: true,
        type: "company",
        targetUserId,
      };
    }

    // 3. If not a company, it's a user-to-user connection
    const request = await FriendRequest.findOne({
      $or: [
        { sender: userId, receiver: targetUserId },
        { sender: targetUserId, receiver: userId },
      ],
      status: { $in: ["pending", "accepted"] },
    });

    if (!request) {
      throw new Error("No pending or accepted connection found to withdraw");
    }

    if (request.status === "pending") {
      await FriendRequest.deleteOne({ _id: request._id });
    }

    if (request.status === "accepted") {
      await FriendRequest.deleteOne({ _id: request._id });

      await Promise.all([
        User.findByIdAndUpdate(userId, { $inc: { connections: -1 } }),
        User.findByIdAndUpdate(targetUserId, { $inc: { connections: -1 } }),
      ]);
    }

    return {
      message: "Connection withdrawn successfully",
      connectionRemoved: true,
      type: "user",
      status: request.status,
      targetUserId,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to withdraw connection");
  }
};