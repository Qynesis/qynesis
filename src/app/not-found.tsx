import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <span className="text-xs uppercase tracking-[0.3em] text-white/40">Error 404</span>
      <h1 className="text-4xl md:text-6xl font-medium">This page doesn&apos;t exist.</h1>
      <Link
        href="/"
        className="border-b border-white/40 pb-1 text-sm uppercase tracking-wider text-white no-underline transition-colors hover:border-white"
      >
        Back to home
      </Link>
    </main>
  );
}
