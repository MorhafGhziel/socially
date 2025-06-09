import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import ThreadCard from "@/components/cards/ThreadCard";
import { Types } from "mongoose";

interface Author {
  _id: Types.ObjectId;
  id: string;
  name: string;
  image: string;
}

interface Community {
  _id: Types.ObjectId;
  id: string;
  name: string;
  image: string;
}

interface Thread {
  _id: Types.ObjectId;
  text: string;
  author: Author;
  community: Community | null;
  createdAt: Date;
  parentId: Types.ObjectId | null;
  children: {
    _id: Types.ObjectId;
    text: string;
    author: Author;
    createdAt: Date;
  }[];
}

export default async function Home() {
  const user = await currentUser();
  if (!user) return null;

  const { posts } = await fetchPosts();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {posts.map((post: any) => {
              if (!post?.author) return null;

              return (
                <ThreadCard
                  key={post._id.toString()}
                  id={post._id.toString()}
                  currentUserId={user?.id || ""}
                  parentId={post.parentId?.toString() || null}
                  content={post.text}
                  author={{
                    name: post.author.name || "Unknown User",
                    image: post.author.image || "/assets/profile.svg",
                    id: post.author.id || post.author._id.toString(),
                  }}
                  community={
                    post.community
                      ? {
                          id:
                            post.community.id || post.community._id.toString(),
                          name: post.community.name || "",
                          image: post.community.image || "",
                        }
                      : null
                  }
                  createdAt={new Date(post.createdAt).toISOString()}
                  comments={
                    post.children?.map((child: any) => ({
                      author: {
                        image: child.author?.image || "/assets/profile.svg",
                      },
                      content: child.text,
                      createdAt: new Date(child.createdAt).toISOString(),
                    })) || []
                  }
                  likes={post.likes?.map((like: any) => like.id) || []}
                />
              );
            })}
          </>
        )}
      </section>
    </>
  );
}
