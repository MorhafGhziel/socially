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

    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: "Thread",
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
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

export async function fetchActivityForUser(userId: string) {
  try {
    await connectToDB();
    // Find the user
    const user = await User.findOne({ id: userId });
    if (!user) return [];
    // Find all threads authored by the user
    const userThreads = await Thread.find({ author: user._id });
    const userThreadIds = userThreads.map((t) => t._id);
    // Find all replies/comments where parentId is one of the user's threads
    const replies = await Thread.find({ parentId: { $in: userThreadIds } })
      .populate({
        path: "author",
        model: User,
        select: "id name username image",
      })
      .populate({
        path: "parentId",
        model: Thread,
        select: "_id text",
      })
      .sort({ createdAt: -1 });
    return replies.map((reply) => {
      // Defensive checks for populated author and parentId
      const authorObj =
        reply.author && typeof reply.author === "object" && "id" in reply.author
          ? (reply.author as unknown as {
              id?: string;
              name?: string;
              username?: string;
              image?: string;
            })
          : null;
      const parentObj =
        reply.parentId &&
        typeof reply.parentId === "object" &&
        "text" in reply.parentId
          ? (reply.parentId as unknown as { text?: string })
          : null;
      return {
        id: reply._id.toString(),
        type: "reply",
        user: {
          id: authorObj?.id || "",
          name: authorObj?.name || "Unknown User",
          username: authorObj?.username || "",
          image: authorObj?.image || "/assets/profile.svg",
        },
        message: `replied to your thread: "${
          parentObj?.text && typeof parentObj.text === "string"
            ? parentObj.text.slice(0, 30)
            : "..."
        }"`,
        time: reply.createdAt,
      };
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return [];
  }
}
