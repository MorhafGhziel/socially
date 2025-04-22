"use server";

import Thread from "../models/thread.model";
import User from "../models/user.model";
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

    // Create the thread with string IDs
    const createdThread = await Thread.create({
      text,
      author,
      community: communityId,
      parentId: null,
      children: [],
    });

    // Update user's threads array
    await User.findOneAndUpdate(
      { id: author },
      { $push: { threads: createdThread._id.toString() } }
    );

    revalidatePath(path);

    // Convert to plain object before returning
    const threadObject = createdThread.toJSON();
    return threadObject;
  } catch (error: any) {
    console.error("Error in createThread:", error);
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id id name parentId image",
      },
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postQuery;

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}
