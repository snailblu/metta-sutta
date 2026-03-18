import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");

    let translations;
    if (query) {
      translations = await convex.query(api.translations.search, { query });
    } else {
      translations = await convex.query(api.translations.list, { limit });
    }

    // Parse result JSON
    const parsed = translations.map((t: any) => ({
      ...t,
      result: JSON.parse(t.result),
    }));

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("List translations error:", error);
    return new Response(JSON.stringify({ error: "Failed to list" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
