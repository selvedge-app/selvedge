import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      createdBy: true,
      activities: { orderBy: { createdAt: "desc" }, include: { user: true } },
      comments: { orderBy: { createdAt: "desc" }, include: { user: true } },
    },
  });

  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(product);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Track stage changes
  if (body.stage && body.stage !== existing.stage) {
    await prisma.activity.create({
      data: {
        type: "stage_change",
        message: `${user.name} moved this from ${existing.stage} to ${body.stage}`,
        metadata: { from: existing.stage, to: body.stage },
        productId: id,
        userId: user.id,
      },
    });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: body,
    include: { createdBy: true },
  });

  return Response.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
