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
