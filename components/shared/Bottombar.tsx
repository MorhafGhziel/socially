"use client";

import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";

function Bottombar() {
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          // Only show the profile link if signed in
          if (link.route === "/profile") {
            if (!userId) return null;
          }
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              href={
                link.route === "/profile" && userId
                  ? `/profile/${userId}`
                  : link.route
              }
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
        {/* Show Sign In button in place of profile link if not signed in */}
        <SignedOut>
          <Link
            href="/sign-in"
            className="bottombar_link flex flex-col items-center justify-center"
          >
            <Image
              src="/assets/user.svg"
              alt="Sign In"
              width={24}
              height={24}
            />
            <span className="text-subtle-medium text-light-1 max-sm:hidden">
              Sign In
            </span>
          </Link>
        </SignedOut>
      </div>
    </section>
  );
}

export default Bottombar;
