import { Request, Response } from "express";
import * as CompanyFollowService from "../service/company.service";
import asyncHandler from "../utils/asyncHandler";

export const handleCompanyFollowUnfollow = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { actionType } = req.params;
    const { companyId } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ error: true, message: "Unauthorized user" });
    }

    try {
      let result;
      switch (actionType) {
        case "follow":
          result = await CompanyFollowService.followCompany(userId, companyId);
          return res.status(200).json(result);

        case "unfollow":
          result = await CompanyFollowService.unfollowCompany(
            userId,
            companyId
          );
          return res.status(200).json(result);

        default:
          return res
            .status(400)
            .json({
              message: 'Invalid actionType. Use "follow" or "unfollow".',
            });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);
