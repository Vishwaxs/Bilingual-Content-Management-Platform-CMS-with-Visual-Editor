import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely extract a human-readable message from an unknown thrown value.
 *
 * Supabase/PostgREST errors are plain objects (not `Error` instances), so a
 * `catch (err: any)` that reads `err.message` silently disables type-checking.
 * Narrowing on `unknown` keeps type safety while still surfacing a useful
 * message for `Error`s, `{ message }` objects, and raw strings.
 */
export function getErrorMessage(err: unknown, fallback = ""): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}
