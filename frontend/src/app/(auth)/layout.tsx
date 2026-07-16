import Link from "next/link";
import { Feather } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-wash flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5"
        aria-label="Inkwell home"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-3 text-primary-foreground shadow-sm">
          <Feather className="size-5" aria-hidden />
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-display text-2xl font-semibold tracking-tight">
            Inkwell
          </span>
          <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            AI blog studio
          </span>
        </span>
      </Link>
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-lg sm:p-8">
        {children}
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-balance text-muted-foreground">
        Draft with AI, edit like an editor, publish to Medium.
      </p>
    </div>
  );
}
