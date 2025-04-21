import { Request, Response } from "express";
import * as ExploreService from "../service/explore.service";
import asyncHandler from "../utils/asyncHandler";

export const getExplore = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized user" });
    }
    const result = await ExploreService.getExploreList(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
});
