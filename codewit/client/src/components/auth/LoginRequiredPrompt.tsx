import { Link } from "react-router-dom";

import { CenterPrompt } from "../placeholders";

interface LoginRequiredPromptProps {
  message?: string,
}

export default function LoginRequiredPrompt({
  message = "To visit this page, you need to be logged in.",
}: LoginRequiredPromptProps) {
  return (
    <CenterPrompt header="Log in to proceed">
      <p className="mt-2 text-center text-white">
        {message}
      </p>
      <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/"
          className="w-full rounded-md bg-zinc-700 px-4 py-2 text-center text-white transition hover:bg-zinc-600 sm:w-auto"
        >
          Return Home
        </Link>
        <a
          href="/api/oauth2/google"
          className="w-full rounded-md bg-accent-500 px-4 py-2 text-center text-white transition hover:bg-accent-600 sm:w-auto"
        >
          Log In
        </a>
      </div>
    </CenterPrompt>
  );
}
