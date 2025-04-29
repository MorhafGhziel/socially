"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import mongoose from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  image: string;
  username: string;
}

interface PopulatedCommunity {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  image: string;
}

interface PopulatedChild {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: PopulatedAuthor;
  createdAt: Date;
}

interface PopulatedThread {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: PopulatedAuthor;
  community?: PopulatedCommunity | null;
  createdAt: Date;
  parentId?: mongoose.Types.ObjectId | null;
  children: PopulatedChild[];
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  try {
    await connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio: bio || "",
        image,
        onboarded: true,
      },
      { upsert: true, new: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();

    const user = await User.findOne({ id: userId });
    if (!user) {
      console.log("User not found with id:", userId);
      return { threads: [], replies: [] };
    }

    // Find all threads created by the user
    const userThreads = (await Thread.find({
      author: user._id,
      parentId: { $in: [null, undefined] },
    })
      .populate<{ author: PopulatedAuthor }>({
        path: "author",
        model: User,
        select: "_id id name image username",
      })
      .populate<{ community: PopulatedCommunity }>({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate<{ children: PopulatedChild[] }>({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id id name image username",
        },
      })
      .sort({ createdAt: "desc" })
      .lean()) as unknown as PopulatedThread[];

    // Find all replies by the user
    const userReplies = (await Thread.find({
      author: user._id,
      parentId: { $ne: null },
    })
      .populate<{ author: PopulatedAuthor }>({
        path: "author",
        model: User,
        select: "_id id name image username",
      })
      .populate({
        path: "parentId",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id id name image username",
        },
      })
      .sort({ createdAt: "desc" })
      .lean()) as unknown as PopulatedThread[];

    const formattedThreads = userThreads.map((thread) => ({
      _id: thread._id.toString(),
      text: thread.text,
      author: {
        id: thread.author.id,
        name: thread.author.name,
        image: thread.author.image,
        username: thread.author.username,
      },
      community: thread.community
        ? {
            id: thread.community._id.toString(),
            name: thread.community.name,
            image: thread.community.image,
          }
        : null,
      createdAt: thread.createdAt.toISOString(),
      parentId: thread.parentId?.toString() || null,
      children: thread.children.map((child) => ({
        _id: child._id.toString(),
        text: child.text,
        author: {
          id: child.author.id,
          name: child.author.name,
          image: child.author.image,
          username: child.author.username,
        },
        createdAt: child.createdAt.toISOString(),
      })),
    }));

    const formattedReplies = userReplies.map((reply) => ({
      _id: reply._id.toString(),
      text: reply.text,
      author: {
        id: reply.author.id,
        name: reply.author.name,
        image: reply.author.image,
        username: reply.author.username,
      },
      parentId: reply.parentId?._id.toString() || null,
      createdAt: reply.createdAt.toISOString(),
    }));

    return {
      threads: formattedThreads,
      replies: formattedReplies,
    };
  } catch (error: any) {
    console.error("Error fetching user content:", error);
    return { threads: [], replies: [] };
  }
}

export async function fetchCommunityThreads(communityId: string) {
  try {
    const threads = await Thread.find({ community: communityId })
      .sort({ createdAt: "desc" })
      .populate<{ author: PopulatedAuthor }>({
        path: "author",
        model: User,
        select: "_id id name image username",
      })
      .populate<{ community: PopulatedCommunity }>({
        path: "community",
        model: Community,
        select: "name id image _id",
      })
      .populate<{ children: PopulatedChild[] }>({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id id name image username",
        },
      })
      .exec();

    const formattedThreads = threads.map((thread) => ({
      _id: thread._id.toString(),
      text: thread.text,
      author: {
        id: thread.author.id,
        name: thread.author.name,
        image: thread.author.image,
        username: thread.author.username,
      },
      community: thread.community
        ? {
            id: thread.community._id.toString(),
            name: thread.community.name,
            image: thread.community.image,
          }
        : null,
      createdAt: thread.createdAt.toISOString(),
      parentId: thread.parentId?.toString() || null,
      children: thread.children.map((child) => ({
        _id: child._id.toString(),
        text: child.text,
        author: {
          id: child.author.id,
          name: child.author.name,
          image: child.author.image,
          username: child.author.username,
        },
        createdAt: child.createdAt.toISOString(),
      })),
    }));

    return { threads: formattedThreads };
  } catch (error) {
    console.error("Error fetching community threads:", error);
    throw error;
  }
}

export async function fetchSuggestedUsers(userId: string, limit: number = 4) {
  try {
    await connectToDB();

    // Find users except the current user
    const suggestedUsers = await User.find({
      id: { $ne: userId },
      onboarded: true,
    })
      .select("id name username image")
      .limit(limit);

    return suggestedUsers;
  } catch (error: any) {
    console.error("Error fetching suggested users:", error);
    throw error;
  }
}
