import mongoose, { Types } from "mongoose";
import User from "../models/User";
import Company from "../models/Company";
import FriendRequest from "../models/FriendRequest";

export const followCompany = async (userId: string, companyId: string) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(companyId)) {
    throw new Error('Invalid user or company ID');
  }

  const company = await Company.findById(companyId);
  const user = await User.findById(userId);

  if (!company || !user) {
    throw new Error('User or Company not found');
  }

  const alreadyFollowing = user.followingCompanies.includes(company._id);
  if (alreadyFollowing) {
    return { message: 'Already following this company' };
  }

  user.followingCompanies.push(company._id);
  user.connections += 1;

  company.followers.push(user._id);

  await Promise.all([user.save(), company.save()]);

  return { message: 'Company followed successfully' };
};

export const unfollowCompany = async (userId: string, companyId: string) => {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(companyId)) {
    throw new Error('Invalid user or company ID');
  }

  const company = await Company.findById(companyId);
  const user = await User.findById(userId);

  if (!company || !user) {
    throw new Error('User or Company not found');
  }

  const wasFollowing = user.followingCompanies.includes(company._id);
  if (!wasFollowing) {
    return { message: 'You are not following this company' };
  }

  user.followingCompanies = user.followingCompanies.filter(
    (id) => id.toString() !== company._id.toString()
  );
  user.connections = Math.max(user.connections - 1, 0);

  company.followers = company.followers.filter(
    (id) => id.toString() !== user._id.toString()
  );

  await Promise.all([user.save(), company.save()]);

  return { message: 'Company unfollowed successfully' };
};



