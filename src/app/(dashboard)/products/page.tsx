"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { type Stage, STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from "@/lib/stages";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  stage: Stage;
  season: string | null;
  collection: string | null;
  updatedAt: string;
  createdBy: { name: string } | null;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-400 py-12 text-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState(
    searchParams.get("stage") || ""
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (stageFilter) params.set("stage", stageFilter);
    if (search) params.set("search", search);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, [stageFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <Link
          href="/products/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 w-64"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">All Stages</option>
          {STAGE_ORDER.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">
          Loading...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400 mb-4">No products found</p>
          <Link
            href="/products/new"
            className="text-sm font-medium underline text-gray-600 hover:text-gray-900"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold group-hover:text-gray-700 truncate">
                    {product.name}
                  </h3>
                  {product.sku && (
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {product.sku}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STAGE_COLORS[product.stage]}`}
                >
                  {STAGE_LABELS[product.stage]}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                {product.collection && <span>{product.collection}</span>}
                {product.season && <span>{product.season}</span>}
                <span className="capitalize">
                  {product.category.toLowerCase()}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-300">
                Updated{" "}
                {new Date(product.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
