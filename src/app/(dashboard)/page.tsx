import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from "@/lib/stages";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getOrCreateUser();

  const [products, stageCounts, recentActivity] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { createdBy: true },
    }),
    prisma.product.groupBy({
      by: ["stage"],
      _count: { id: true },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { product: true, user: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    stageCounts.map((s) => [s.stage, s._count.id])
  );
  const totalProducts = stageCounts.reduce((sum, s) => sum + s._count.id, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {totalProducts} product{totalProducts !== 1 ? "s" : ""} across your
          pipeline
        </p>
      </div>

      {/* Stage overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {STAGE_ORDER.filter((s) => s !== "ARCHIVED").map((stage) => (
          <Link
            key={stage}
            href={`/products?stage=${stage}`}
            className="rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {STAGE_LABELS[stage]}
            </p>
            <p className="mt-2 text-2xl font-bold">{countMap[stage] || 0}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent products */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold">Recently Updated</h3>
            <Link
              href="/products"
              className="text-xs font-medium text-gray-500 hover:text-gray-900"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No products yet.{" "}
                <Link href="/products/new" className="underline">
                  Create one
                </Link>
              </div>
            ) : (
              products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">
                      {p.collection || "No collection"} &middot;{" "}
                      {p.season || "No season"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLORS[p.stage]}`}
                  >
                    {STAGE_LABELS[p.stage]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No activity yet
              </div>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="px-5 py-3">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.product.name} &middot;{" "}
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
