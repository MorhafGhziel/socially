import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreadCard from "@/components/cards/ThreadCard";
import {
  fetchUserThreads,
  fetchCommunityThreads,
} from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";

interface Thread {
  _id: string;
  text: string;
  author: {
    id: string;
    name: string;
    image: string;
    username: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  parentId: string | null;
  children: {
    _id: string;
    text: string;
    author: {
      id: string;
      name: string;
      image: string;
      username: string;
    };
    createdAt: string;
  }[];
}

interface Reply {
  _id: string;
  text: string;
  author: {
    id: string;
    name: string;
    image: string;
    username: string;
  };
  parentId: string | null;
  createdAt: string;
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let result: { threads: Thread[]; replies: Reply[] } | null = null;

  if (accountType === "Community") {
    const communityResult = await fetchCommunityThreads(accountId);
    result = { threads: communityResult.threads || [], replies: [] };
  } else {
    const userResult = await fetchUserThreads(accountId);
    result = {
      threads: userResult.threads || [],
      replies: userResult.replies || [],
    };
  }

  if (!result) return null;

  return (
    <section className="mt-9 flex flex-col gap-10">
      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="tab">
          <TabsTrigger value="threads" className="tab-trigger">
            Threads
          </TabsTrigger>
          <TabsTrigger value="replies" className="tab-trigger">
            Replies
          </TabsTrigger>
          <TabsTrigger value="tagged" className="tab-trigger">
            Tagged
          </TabsTrigger>
        </TabsList>
        <TabsContent value="threads" className="w-full text-light-1">
          {!result.threads || result.threads.length === 0 ? (
            <p className="no-result">No threads found</p>
          ) : (
            <div className="flex flex-col gap-4">
              {result.threads.map((thread) => (
                <article
                  key={thread._id}
                  className="bg-dark-2 p-7 rounded-xl hover:bg-dark-3 transition-all"
                >
                  <ThreadCard
                    id={thread._id}
                    currentUserId={currentUserId}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={{
                      name: thread.author.name,
                      image: thread.author.image,
                      id: thread.author.id,
                    }}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children.map((child) => ({
                      author: {
                        image: child.author.image,
                      },
                      content: child.text,
                      createdAt: child.createdAt,
                    }))}
                    isComment
                  />
                </article>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="replies" className="w-full text-light-1">
          {!result.replies || result.replies.length === 0 ? (
            <p className="no-result">No replies found</p>
          ) : (
            <div className="flex flex-col gap-4">
              {result.replies.map((reply) => (
                <article
                  key={reply._id}
                  className="bg-dark-2 p-7 rounded-xl hover:bg-dark-3 transition-all"
                >
                  <ThreadCard
                    id={reply._id}
                    currentUserId={currentUserId}
                    parentId={reply.parentId}
                    content={reply.text}
                    author={{
                      name: reply.author.name,
                      image: reply.author.image,
                      id: reply.author.id,
                    }}
                    community={null}
                    createdAt={reply.createdAt}
                    comments={[]}
                    isComment
                  />
                </article>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="tagged" className="w-full text-light-1">
          <p className="no-result">No tagged threads found</p>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default ThreadsTab;
