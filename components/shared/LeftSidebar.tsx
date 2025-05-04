"use client";

import { sidebarLinks } from "@/constants";
import {
  SignedIn,
  SignedOut,
  SignOutButton,
  SignInButton,
  useAuth,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();

  const handleSignOut = () => {
    router.push("/sign-in");
  };

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          let linkRoute = link.route;
          if (link.route === "/profile" && userId) {
            linkRoute = `/profile/${userId}`;
          }

          // Only skip rendering the profile link if not signed in
          // Also hide the profile link on small screens
          if (
            (link.route === "/profile" && !userId) ||
            (link.route === "/profile" &&
              typeof window !== "undefined" &&
              window.innerWidth < 1024)
          ) {
            return null;
          }

          const isActive =
            (pathname.includes(linkRoute) && linkRoute.length > 1) ||
            pathname === linkRoute;

          return (
            <Link
              href={linkRoute}
              key={link.label}
              className={`leftsidebar_link ${
                link.route === "/profile" ? "max-lg:hidden" : ""
              } ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-light-1 max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton>
            <div
              className="flex cursor-pointer gap-4 p-4"
              onClick={handleSignOut}
            >
              <Image
                src="/assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
              <p className="text-light-2 max-lg:hidden">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="leftsidebar_link w-full flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-lg py-3 px-4 transition-colors duration-200 hover:from-primary-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-base sm:text-lg max-w-full"
              style={{ minHeight: 48 }}
            >
              <span className="text-white font-semibold">Sign In</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
}

export default LeftSidebar;
