import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { fetchActivityForUser } from "@/lib/actions/thread.actions";

export default async function ActivityPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <section className="flex flex-col min-h-[70vh]">
        <h1 className="head-text">Activity</h1>
        <div className="w-full">
          <p className="text-lg text-gray-400 bg-dark-2/80 px-8 py-6 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md mt-8">
            You must be signed in to view your activity.
          </p>
        </div>
      </section>
    );
  }

  const activities = await fetchActivityForUser(user.id);

  return (
    <section className="flex flex-col min-h-[70vh]">
      <h1 className="head-text">Activity</h1>
      <div className="w-full flex flex-col gap-6 mt-9">
        {activities.length === 0 ? (
          <p className="text-lg text-gray-400 bg-dark-2/80 px-8 py-6 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-md">
            No activity yet
          </p>
        ) : (
          activities.map((activity: any) => (
            <div
              key={activity.id}
              className="group transition-all duration-200 bg-gradient-to-br from-dark-2/80 to-dark-3/80 border border-gray-700/60 shadow-2xl rounded-2xl px-8 py-6 flex items-center gap-6 hover:scale-[1.025] hover:border-primary-500/80 hover:shadow-primary-500/20 backdrop-blur-md"
              style={{ backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-4">
                <Image
                  src={activity.user.image}
                  alt={activity.user.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover border-2 border-primary-500/40 group-hover:border-primary-500 shadow-md"
                />
                <div>
                  <span className="text-lg font-bold text-white">
                    {activity.user.name}
                  </span>
                  <span className="text-gray-400 ml-2 text-base">
                    @{activity.user.username}
                  </span>
                  <span className="block text-light-2 mt-1 text-lg">
                    {activity.message}
                  </span>
                </div>
              </div>
              <span className="ml-auto text-sm text-gray-400 font-mono opacity-80">
                {activity.time instanceof Date
                  ? activity.time.toLocaleString()
                  : activity.time}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
