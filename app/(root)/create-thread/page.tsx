import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthRequiredMessage from "@/components/shared/AuthRequiredMessage";

async function page() {
  const user = await currentUser();
  if (!user)
    return (
      <AuthRequiredMessage message="You must be signed in to create a thread." />
    );
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  return (
    <div>
      <>
        <h1 className="head-text text-light">Create Thread</h1>

        <PostThread userId={user.id} />
      </>
    </div>
  );
}

export default page;
