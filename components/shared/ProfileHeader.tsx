// ProfileHeader component displays the user's profile information and edit button if it's the current user
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Props for the ProfileHeader component
interface Props {
  accountId: string; // ID of the profile being viewed
  authUserId: string; // ID of the currently authenticated user
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
}

// ProfileHeader displays user info and edit button if viewing own profile
const ProfileHeader = async ({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
}: Props) => {
  // Check if the profile belongs to the current user
  const isCurrentUser = accountId === authUserId;

  return (
    <div className="flex w-full flex-col justify-start">
      {/* Top section: profile image, name, username, and edit button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            {/* User profile image */}
            <Image
              src={imgUrl}
              alt="Profile image"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex-1">
            {/* User name and username */}
            <h2 className="text-left text-heading3-bold text-light-1">
              {name}
            </h2>
            <p className="text-base-medium text-gray-1">@{username}</p>
          </div>
        </div>

        {/* Show edit button if this is the current user's profile */}
        {isCurrentUser && (
          <Link href="/onboarding?edit=true">
            <Button className="bg-primary-500 hover:bg-primary-600">
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {/* User bio */}
      <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>

      {/* Divider */}
      <div className="mt-12 h-0.5 w-full bg-dark-3" />
    </div>
  );
};

export default ProfileHeader;
