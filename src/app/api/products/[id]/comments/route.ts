import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getOrCreateUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { body } = await request.json();

  if (!body?.trim()) {
    return Response.json({ error: "Comment body is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      body,
      productId: id,
      userId: user.id,
    },
    include: { user: true },
  });

  await prisma.activity.create({
    data: {
      type: "comment",
      message: `${user.name} commented`,
      productId: id,
      userId: user.id,
    },
  });

  return Response.json(comment, { status: 201 });
}
