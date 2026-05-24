/**
 * Normalizes Neon connection strings for serverless drivers.
 * `channel_binding=require` breaks @neondatabase/serverless HTTP/WebSocket on many setups.
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env in the project root.",
    );
  }

  const parsed = new URL(url);
  parsed.searchParams.delete("channel_binding");

  return parsed.toString();
}
