import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
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
  });

  return { message: "Friend request sent", request };
};

export const acceptFriendRequest = async (requestId: string) => {
  const request = await FriendRequest.findById(requestId);

  if (!request || request.status !== "pending") {
    throw new Error("Request not found or already handled");
  }

  request.status = "accepted";
  request.acceptedAt = new Date();
  await request.save();

  // Increment connections for both sender and receiver
  await Promise.all([
    User.findByIdAndUpdate(request.sender, { $inc: { connections: 1 } }),
    User.findByIdAndUpdate(request.receiver, { $inc: { connections: 1 } }),
  ]);

  return { message: "Friend request accepted and connections updated" };
};

export const rejectFriendRequest = async (requestId: string) => {
  const request = await FriendRequest.findById(requestId);
  if (!request || request.status !== "pending")
    throw new Error("Request not found or already handled");

  request.status = "rejected";
  await request.save();

  return { message: "Friend request rejected" };
};

export const getFriendRequests = async (userId: string) => {
  const requests = await FriendRequest.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("sender", "username email profile")
    .populate("receiver", "username email profile")
    .sort({ createdAt: -1 });

  return requests;
};
