import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string,
  comment?: string
) => {
  const existing = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
  });
  if (existing) throw new Error("Friend request already sent.");

  const request = await FriendRequest.create({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
    requestedAt: new Date(),
    comment: comment || "",
  });
  return { message: "Friend request sent", request };
};

export const acceptFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  const request = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (!request) {
    throw new Error("Friend request not found or already handled");
  }

  request.status = "accepted";
  request.acceptedAt = new Date();
  await request.save();

  await Promise.all([
    User.findByIdAndUpdate(request.sender, { $inc: { connections: 1 } }),
    User.findByIdAndUpdate(request.receiver, { $inc: { connections: 1 } }),
  ]);

  return { message: "Friend request accepted and connections updated" };
};

export const rejectFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  const request = await FriendRequest.findOne({
    sender: senderId,
    receiver: receiverId,
    status: "pending",
  });

  if (!request) {
    throw new Error("Friend request not found or already handled");
  }

  request.status = "rejected";
  await request.save();

  return { message: "Friend request rejected" };
};
export const getFriendRequests = async (userId: string) => {
  const requests = await FriendRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "username email coverImage")
    .populate("receiver", "username email coverImage")
    .sort({ createdAt: -1 });

  return requests;
};
