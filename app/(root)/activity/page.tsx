import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { fetchActivityForUser } from "@/lib/actions/thread.actions";

export default async function ActivityPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <section className="main-container px-2 sm:px-6 py-6 w-full max-w-2xl mx-auto">
        <h1 className="head-text text-left mb-6">Activity</h1>
        <p className="no-result">
          You must be signed in to view your activity.
        </p>
      </section>
    );
  }

  const activities = await fetchActivityForUser(user.id);

  return (
    <section className="main-container px-2 sm:px-6 py-6 w-full max-w-2xl mx-auto">
      <h1 className="head-text text-left mb-6">Activity</h1>
      <div className="flex flex-col gap-4">
        {activities.length === 0 ? (
          <p className="no-result">No activity yet</p>
        ) : (
          activities.map((activity: any) => (
            <div
              key={activity.id}
              className="activity-card flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-dark-2 rounded-lg p-4 w-full shadow-md"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={activity.user.image}
                  alt={activity.user.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <span className="text-light-1 font-semibold">
                    {activity.user.name}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    @{activity.user.username}
                  </span>
                  <span className="block text-light-2 mt-1 text-base">
                    {activity.message}
                  </span>
                </div>
              </div>
              <span className="ml-auto text-xs text-gray-500 mt-2 sm:mt-0">
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
