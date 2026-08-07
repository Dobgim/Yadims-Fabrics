import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 renamed the `middleware` file convention to `proxy`. Behaviour is
 * unchanged: refresh the Supabase auth cookie on every request, and guard
 * `/admin` — the only gated area, since the shop has no customer accounts.
 *
 * This is a first line of defence, not the only one. Server Actions are POSTs
 * to whichever route uses them, so a matcher change or a refactor could
 * silently remove coverage — every privileged action therefore re-checks the
 * caller's role against the session itself (`requireStaff` in
 * `src/app/actions/admin.ts`).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Every path except static assets, image optimisation output, and files
     * with an extension (favicon, og images, robots.txt, …).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
