import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as UserService from "../service/user.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await UserService.loginUser(email, password);
    res.status(200).json({ error: false, ...result });
  } catch (error: any) {
    res
      .status(401)
      .json({ error: true, message: error.message || "Login failed" });
  }
});

export const inviteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const users = await UserService.getUsersForInvitation(userId);

    res.status(200).json({ error: false, users });
  } catch (error: any) {
    res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch users for invitation",
    });
  }
});

export const getConnections = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized user" });
      }

      const connections = await UserService.getConnections(userId);

      res.status(200).json({ error: false, connections });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || "Failed to fetch connections",
      });
    }
  }
); 

export const getMyConnections = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized user" });
      }

      const connections = await UserService.getMyConnections(userId);

      res.status(200).json({ error: false, connections });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || "Failed to fetch connections",
      });
    }
  }
);

export const getFollowing = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized user" });
      }

      const connections = await UserService.getMyConnections(userId);

      res.status(200).json({ error: false, connections });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || "Failed to fetch connections",
      });
    }
  }
);

export const WithdrawConnection = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized user" });
      }
      const { targetUserId } = req.body;

      const result = await UserService.withdrawConnection(userId, targetUserId);

      res.status(200).json({ error: false, ...result });
    } catch (error: any) {
      res.status(500).json({ error: true, message: error.message });
    }
  }
);
