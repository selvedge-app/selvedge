import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await request.json();
  if (!message?.trim()) {
    return Response.json({ error: "Message is required" }, { status: 400 });
  }

  // Gather current data context for Claude
  const [products, stageCounts] = await Promise.all([
    prisma.product.findMany({
      include: { createdBy: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.product.groupBy({
      by: ["stage"],
      _count: { id: true },
    }),
  ]);

  const systemPrompt = `You are Selvedge AI, an assistant for a fashion product lifecycle management tool. You help users understand the status of their products, collections, and pipeline.

Current data summary:
- Total products: ${products.length}
- By stage: ${stageCounts.map((s) => `${s.stage}: ${s._count.id}`).join(", ")}

Product data (most recent 100):
${products
  .map(
    (p) =>
      `- "${p.name}" (SKU: ${p.sku || "N/A"}) | Stage: ${p.stage} | Collection: ${p.collection || "N/A"} | Season: ${p.season || "N/A"} | Category: ${p.category} | Created by: ${p.createdBy?.name || "Unknown"} | Updated: ${p.updatedAt.toISOString().split("T")[0]}`
  )
  .join("\n")}

Answer concisely. If the user asks about specific products, filter from the data above. If they ask for counts or summaries, compute from the data. If you don't have enough data to answer, say so.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return Response.json({ response: text });
}
