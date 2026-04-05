import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import type { Category, Stage } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const stage = searchParams.get("stage") as Stage | null;
  const collection = searchParams.get("collection");
  const season = searchParams.get("season");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (stage) where.stage = stage;
  if (collection) where.collection = collection;
  if (season) where.season = season;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { createdBy: true },
    orderBy: { updatedAt: "desc" },
  });

  return Response.json(products);
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, sku, description, category, season, collection, materials, colorway, targetPrice } = body;

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      sku: sku || null,
      description: description || null,
      category: (category as Category) || "OTHER",
      season: season || null,
      collection: collection || null,
      materials: materials || null,
      colorway: colorway || null,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      createdById: user.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "created",
      message: `${user.name} created this product`,
      productId: product.id,
      userId: user.id,
    },
  });

  return Response.json(product, { status: 201 });
}
