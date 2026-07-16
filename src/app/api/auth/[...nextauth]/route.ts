import { handlers } from "@/lib/auth";

/** Auth.js must run on Node (Prisma adapter + credentials). */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
