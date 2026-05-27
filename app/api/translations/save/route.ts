import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { logger } from "@/lib/logger";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const { original, result } = await req.json();

    if (!original || !result) {
      return new Response(JSON.stringify({ error: "original and result are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = await convex.mutation(api.translations.save, {
      original,
      result: JSON.stringify(result),
    });

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Save translation error", error);
    return new Response(JSON.stringify({ error: "Failed to save" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
