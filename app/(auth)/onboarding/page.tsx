import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";

async function Page() {
  const user = await currentUser();

  const userData = {
    id: user?.id || "",
    objectId: user?.id || "",
    username: user?.username || "",
    name: user?.firstName || "",
    bio: "",
    image: user?.imageUrl || "",
  };

  const userInfo = {};

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="text-light-2 text-base-regular">
        Complete your profile now to use Socially
      </p>
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
