import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thread | Socially",
  description: "View and reply to thread",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  try {
    // Resolve params first since we need the ID
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id)
      return <div className="text-center mt-10">Thread ID is required</div>;

    // Fetch user and thread in parallel
    const [user, thread] = await Promise.all([
      currentUser(),
      fetchThreadById(id),
    ]);

    if (!user)
      return (
        <div className="text-center mt-10">
          Please sign in to view this thread
        </div>
      );
    if (!thread)
      return <div className="text-center mt-10">Thread not found</div>;

    // Fetch user info only if we have a user
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    // Convert MongoDB document to plain object
    const populatedThread = JSON.parse(JSON.stringify(thread));

    return (
      <section className="relative">
        <div>
          <ThreadCard
            key={populatedThread._id}
            id={populatedThread._id}
            currentUserId={user?.id || ""}
            parentId={populatedThread.parentId || null}
            content={populatedThread.text}
            author={{
              name: populatedThread.author?.name || "Unknown User",
              image: populatedThread.author?.image || "/assets/profile.svg",
              id: populatedThread.author?.id || "",
            }}
            community={null}
            createdAt={new Date(populatedThread.createdAt).toISOString()}
            comments={
              populatedThread.children?.map((child: any) => ({
                author: {
                  image: child.author?.image || "/assets/profile.svg",
                },
                content: child.text,
                createdAt: new Date(child.createdAt).toISOString(),
              })) || []
            }
          />
        </div>

        <div className="mt-7">
          <Comment
            threadId={id}
            currentUserImg={userInfo.image}
            currentUserId={user.id}
          />

          <div className="mt-10">
            {populatedThread.children?.slice(0, 3).map((childItem: any) => (
              <ThreadCard
                key={childItem._id}
                id={childItem._id}
                currentUserId={user.id}
                parentId={childItem.parentId || null}
                content={childItem.text}
                author={{
                  name: childItem.author?.name || "Unknown User",
                  image: childItem.author?.image || "/assets/profile.svg",
                  id: childItem.author?.id || "",
                }}
                community={null}
                createdAt={new Date(childItem.createdAt).toISOString()}
                comments={
                  childItem.children?.slice(0, 2).map((child: any) => ({
                    author: {
                      image: child.author?.image || "/assets/profile.svg",
                    },
                    content: child.text,
                    createdAt: new Date(child.createdAt).toISOString(),
                  })) || []
                }
                isComment
              />
            ))}
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error loading thread:", error);
    return (
      <div className="text-center mt-10">
        Error loading thread. Please try again later.
      </div>
    );
  }
}
