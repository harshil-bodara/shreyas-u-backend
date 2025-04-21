import Company from "../models/Company";
import FriendRequest from "../models/FriendRequest";
import User from "../models/User";

export const getExploreList = async (userId: string) => {
  try {
    const connected = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    const connectedUserIds = new Set<string>();
    connected.forEach((req) => {
      connectedUserIds.add(req.sender.toString());
      connectedUserIds.add(req.receiver.toString());
    });
    connectedUserIds.add(userId);

    const users = await User.find({
      _id: { $nin: Array.from(connectedUserIds) },
    })
      .select("_id username email coverImage connections designation city")
      .lean();

    const userItems = users.map((user) => ({
      ...user,
      type: Math.random() < 0.5 ? "hr" : "user",
    }));

    // Get companies user is not following
    const loggedInUser = await User.findById(userId);
    const followedCompanyIds = loggedInUser?.followingCompanies || [];

    const companies = await Company.find({ _id: { $nin: followedCompanyIds } })
      .select("_id name description coverImage tags followers")
      .lean();

    const companyItems = companies.map((company) => ({
      _id: company._id,
      name: company.name,
      description: company.description,
      coverImage: company.coverImage,
      tags: company.tags,
      type: "company",
      connections: company.followers.length,
    }));

    const exploreItems = [...userItems, ...companyItems];


    return { error: false, exploreItems };
  } catch (error) {
    throw new Error("Failed to fetch explore list");
  }
};
