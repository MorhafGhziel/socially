"use server";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    await connectToDB();

    // Find the user first
    const user = await User.findOne({ id: author });
    if (!user) throw new Error("User not found");

    // Create thread
    const thread = await Thread.create({
      text,
      author: user._id,
      community: communityId,
      createdAt: new Date(),
    });

    // Update user model
    await User.findByIdAndUpdate(user._id, {
      $push: { threads: thread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch posts with populated author and community
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
        select: "id name image username",
      })
      .populate({
        path: "community",
        model: Community,
        select: "id name image",
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      });

    const [posts, totalPostsCount] = await Promise.all([
      postsQuery.exec(),
      Thread.countDocuments({ parentId: { $in: [null, undefined] } }),
    ]);

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function fetchThreadById(id: string) {
  try {
    await connectToDB();

    // Optimize the query to fetch only necessary fields and limit nested populations
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "id name image",
      })
      .populate({
        path: "children",
        options: { limit: 5 }, // Limit to 5 comments for initial load
        populate: {
          path: "author",
          model: User,
          select: "id name image",
        },
      })
      .lean() // Use lean() for better performance
      .exec();

    if (!thread) {
      throw new Error("Thread not found");
    }

    return thread;
  } catch (error: any) {
    console.error("Error fetching thread:", error);
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    await connectToDB();

    // Find the original thread
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Thread not found");

    // Find the user using Clerk ID
    const user = await User.findOne({ id: userId });
    if (!user) throw new Error(`User not found with id: ${userId}`);

    // Create the comment thread
    const commentThread = await Thread.create({
      text: commentText,
      author: user._id,
      parentId: threadId,
      createdAt: new Date(),
    });

    // Add comment to original thread's children
    originalThread.children.push(commentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    console.error("Error adding comment:", error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}
