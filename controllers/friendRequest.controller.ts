import { Request, Response } from "express";
import * as FriendRequestService from "../service/friendRequest.service";
import asyncHandler from "../utils/asyncHandler";

export const handleFriendRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized user" });
    }

    try {
      switch (type) {
        case "send": {
          const { receiverId,comment } = req.body;
          await FriendRequestService.sendFriendRequest(userId, receiverId,comment);
          return res
            .status(201)
            .json({
              error: false,
              message: "Friend request sent successfully!",
            });
        }

        case "accept": {
          const { requestId } = req.body;
          await FriendRequestService.acceptFriendRequest(requestId, userId);
          return res
            .status(200)
            .json({ error: false, message: "Friend request accepted!" });
        }

        case "reject": {
          const { requestId } = req.body;
          await FriendRequestService.rejectFriendRequest(requestId, userId);
          return res
            .status(200)
            .json({ error: false, message: "Friend request rejected!" });
        }

        case "requests": {
          const requests = await FriendRequestService.getFriendRequests(userId);
          return res.status(200).json({ error: false, requests });
        }

        default:
          return res
            .status(400)
            .json({ error: true, message: "Invalid friend request action" });
      }
    } catch (error: any) {
      return res
        .status(500)
        .json({
          error: true,
          message: error.message || "Internal server error",
        });
    }
  }
);
