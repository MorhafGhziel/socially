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
  connectToDB();

  try {
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

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}
