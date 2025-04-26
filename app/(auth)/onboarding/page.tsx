import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Page = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const user = await currentUser();
  if (!user) return null;

  // Fetch existing user data from our database
  const userInfo = await fetchUser(user.id);

  const isEditMode = searchParams?.edit === "true";

  // If user exists in our database, use their data, otherwise use default values
  const userData = {
    id: user.id,
    objectId: userInfo ? userInfo._id.toString() : user.id,
    username: userInfo?.username || user?.username || "",
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl || "",
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <div className="flex items-center justify-between">
        <h1 className="head-text">
          {isEditMode ? "Edit Profile" : "Onboarding"}
        </h1>
        {isEditMode && (
          <Link href={`/profile/${user.id}`}>
            <Button variant="ghost" className="text-light-2">
              Back
            </Button>
          </Link>
        )}
      </div>
      <p className="text-light-2 text-base-regular mt-3">
        {isEditMode
          ? "Edit your profile information"
          : "Complete your profile now to use Socially"}
      </p>
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile
          user={userData}
          btnTitle={isEditMode ? "Save Changes" : "Continue"}
        />
      </section>
    </main>
  );
};

export default Page;
