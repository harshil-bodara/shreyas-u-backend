import UserIgnore from "../models/UserIgnore";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response } from "express";

export const ignoreUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const { ignoredUserId } = req.body;

    const alreadyIgnored = await UserIgnore.findOne({ userId, ignoredUserId });

    if (!alreadyIgnored) {
      await UserIgnore.create({ userId, ignoredUserId });
    }

    res.status(200).json({
      message: "User ignored successfully",
      ignoredUserId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to ignore user" });
  }
});
