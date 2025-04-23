import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";

interface Props {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const Page = async ({ params }: Props) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const userInfo = await fetchUser(params.id);
    if (!userInfo) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-light-1 text-2xl">Profile not found</p>
          <p className="text-gray-1 mt-2">
            The user you're looking for doesn't exist or hasn't completed
            onboarding.
          </p>
        </div>
      );
    }

    if (!userInfo.onboarded) redirect("/onboarding");

    return (
      <section>
        <ProfileHeader
          accountId={userInfo.id}
          authUserId={user.id}
          name={userInfo.name}
          username={userInfo.username}
          imgUrl={userInfo.image}
          bio={userInfo.bio}
        />
      </section>
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-light-1 text-2xl">An error occurred</p>
        <p className="text-gray-1 mt-2">
          There was an error fetching the user profile. Please try again later.
        </p>
      </div>
    );
  }
};

export default Page;
