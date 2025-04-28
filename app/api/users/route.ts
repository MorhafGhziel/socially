import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export async function GET() {
  try {
    await connectToDB();

    // Get random users who have completed onboarding
    const users = await User.aggregate([
      { $match: { onboarded: true } },
      { $sample: { size: 5 } },
      { $project: { id: 1, name: 1, username: 1, image: 1, bio: 1 } },
    ]);

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
