import Link from "next/link";

export default function AuthRequiredMessage({
  message = "This isn't available until you log in.",
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
      <p className="text-light-1 text-xl mb-4">{message}</p>
      <Link
        href="/sign-in"
        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
      >
        Sign In
      </Link>
    </div>
  );
}
