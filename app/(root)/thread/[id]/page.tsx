import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";

const page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);
  if (!thread) return null;

  // Convert MongoDB document to plain object and handle populated fields
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
            name: populatedThread.author.name,
            image: populatedThread.author.image,
            id: populatedThread.author.id,
          }}
          community={null}
          createdAt={new Date(populatedThread.createdAt).toISOString()}
          comments={populatedThread.children.map((child: any) => ({
            author: {
              image: child.author.image,
            },
            content: child.text,
            createdAt: new Date(child.createdAt).toISOString(),
          }))}
        />
      </div>

      <div className="mt-7">
        <Comment
          threadId={params.id}
          currentUserImg={userInfo.image}
          currentUserId={user.id}
        />

        <div className="mt-10">
          {populatedThread.children.map((childItem: any) => (
            <ThreadCard
              key={childItem._id}
              id={childItem._id}
              currentUserId={user.id}
              parentId={childItem.parentId || null}
              content={childItem.text}
              author={{
                name: childItem.author.name,
                image: childItem.author.image,
                id: childItem.author.id,
              }}
              community={null}
              createdAt={new Date(childItem.createdAt).toISOString()}
              comments={
                childItem.children?.map((child: any) => ({
                  author: {
                    image: child.author.image,
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
};

export default page;
