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
      })
      .populate({
        path: "likes",
        model: User,
        select: "id",
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
      .populate({
        path: "likes",
        model: User,
        select: "id",
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

export async function toggleLike(
  threadId: string,
  userId: string,
  path: string
) {
  try {
    await connectToDB();

    // Find the user using Clerk ID
    const user = await User.findOne({ id: userId });
    if (!user) throw new Error("User not found");

    const thread = await Thread.findById(threadId);
    if (!thread) throw new Error("Thread not found");

    const userLikedIndex = thread.likes.indexOf(user._id);

    if (userLikedIndex === -1) {
      // User hasn't liked the thread yet, so add the like
      thread.likes.push(user._id);
    } else {
      // User has already liked the thread, so remove the like
      thread.likes.splice(userLikedIndex, 1);
    }

    await thread.save();
    revalidatePath(path);

    return { likes: thread.likes.length };
  } catch (error: any) {
    console.error("Error toggling like:", error);
    throw new Error(`Failed to toggle like: ${error.message}`);
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
        select: "_id text parentId",
      })
      .sort({ createdAt: -1 });
    // Filter out replies authored by the user themselves
    const filteredReplies = replies.filter(
      (reply) =>
        reply.author &&
        typeof reply.author === "object" &&
        "id" in reply.author &&
        String(reply.author.id) !== String(userId)
    );

    return filteredReplies;
  } catch (error: any) {
    console.error("Error fetching activity:", error);
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}

export async function deleteThread(threadId: string, path: string) {
  try {
    await connectToDB();

    // Find the thread
    const thread = await Thread.findById(threadId);
    if (!thread) throw new Error("Thread not found");

    // Delete all child threads (comments)
    await Thread.deleteMany({ parentId: threadId });

    // Delete the thread itself
    await Thread.findByIdAndDelete(threadId);

    // Update user's threads array
    await User.findByIdAndUpdate(thread.author, {
      $pull: { threads: threadId },
    });

    revalidatePath(path);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting thread:", error);
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}
