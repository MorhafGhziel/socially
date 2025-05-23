"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
    content: string;
    createdAt: string;
  }[];
  isComment?: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      className={`flex w-full flex-col ${
        isComment ? "mt-7" : "bg-dark-2 p-7 rounded-xl"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              {imageError ? (
                <div className="h-11 w-11 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white text-xs">
                    {author.name.charAt(0)}
                  </span>
                </div>
              ) : (
                <Image
                  src={author.image || "/assets/profile.svg"}
                  alt="Profile image"
                  fill
                  className="rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
            </Link>

            <div className="thread-card_bar" />
          </div>

          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
              </div>

              {comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1 flex items-center gap-1">
                    <Image
                      src={comments[0].author.image || "/assets/profile.svg"}
                      alt="Reply user"
                      width={20}
                      height={20}
                      className="rounded-full object-cover border border-gray-700 inline-block"
                    />
                    replied
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;
