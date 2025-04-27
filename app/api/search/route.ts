import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/user.model";
import Thread from "@/lib/models/thread.model";
import { connectToDB } from "@/lib/mongoose";

export async function GET(req: NextRequest) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  if (!q) {
    return NextResponse.json({ users: [], threads: [] });
  }
  const regex = new RegExp(`^${q}`, "i");
  const [users, threads] = await Promise.all([
    User.find({ $or: [{ name: regex }, { username: regex }] })
      .limit(10)
      .select("id name username image"),
    Thread.find({ text: regex }).limit(10).select("_id text"),
  ]);
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      image: u.image,
    })),
    threads: threads.map((t) => ({ id: t._id.toString(), text: t.text })),
  });
}
