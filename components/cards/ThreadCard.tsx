"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { deleteThread, toggleLike } from "@/lib/actions/thread.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  likes?: string[];
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
  likes = [],
}: Props) => {
  const [imageError, setImageError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(likes.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(likes.length);
  const pathname = usePathname();
  const router = useRouter();
  const isAuthor = currentUserId === author.id;

  const handleDelete = async () => {
    try {
      await deleteThread(id, pathname || "/");
      router.refresh();
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleLike(id, currentUserId, pathname || "/");
      setIsLiked(!isLiked);
      setLikeCount(result.likes);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

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
            <div className="flex justify-between items-center">
              <Link href={`/profile/${author.id}`} className="w-fit">
                <h4 className="cursor-pointer text-base-semibold text-light-1">
                  {author.name}
                </h4>
              </Link>
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="transition-colors"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-dark-2 border-dark-4">
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 focus:bg-dark-3 cursor-pointer"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex gap-3.5">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-1"
                >
                  <Image
                    src={
                      isLiked
                        ? "/assets/heart-filled.svg"
                        : "/assets/heart-gray.svg"
                    }
                    alt="heart"
                    width={24}
                    height={24}
                    className={`cursor-pointer object-contain ${
                      isLiked ? "filter-red" : ""
                    }`}
                  />
                  {likeCount > 0 && (
                    <span className="text-subtle-medium text-gray-1">
                      {likeCount}
                    </span>
                  )}
                </button>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-dark-2 border-dark-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-light-1">
              Delete Post
            </AlertDialogTitle>
            <AlertDialogDescription className="text-light-2">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-dark-3 text-light-1 border-dark-4 hover:bg-dark-4">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
};

export default ThreadCard;
