"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="space-y-4 p-8 text-center">
          <h2 className="text-xl font-semibold">Application error</h2>
          <p className="text-sm text-slate-500">{error.message}</p>
          <button
            onClick={reset}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
