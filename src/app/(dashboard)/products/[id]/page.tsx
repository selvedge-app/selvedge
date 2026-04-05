"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { StagePipeline } from "@/components/stage-pipeline";
import { type Stage, STAGE_LABELS, STAGE_COLORS } from "@/lib/stages";

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user: { name: string } | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { name: string };
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string;
  stage: Stage;
  season: string | null;
  collection: string | null;
  materials: string | null;
  colorway: string | null;
  targetPrice: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { name: string } | null;
  activities: Activity[];
  comments: Comment[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  function fetchProduct() {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function handleAdvance(stage: Stage) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    fetchProduct();
  }

  async function handleComment() {
    if (!comment.trim() || posting) return;
    setPosting(true);
    await fetch(`/api/products/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: comment }),
    });
    setComment("");
    setPosting(false);
    fetchProduct();
  }

  async function handleDelete() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.push("/products");
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">Loading...</div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Product not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{product.name}</h2>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            {product.sku && (
              <span className="font-mono text-xs">{product.sku}</span>
            )}
            <span className="capitalize">
              {product.category.toLowerCase()}
            </span>
            {product.collection && <span>{product.collection}</span>}
            {product.season && <span>{product.season}</span>}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {/* Stage pipeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Pipeline
        </p>
        <StagePipeline
          currentStage={product.stage}
          onAdvance={handleAdvance}
        />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Materials", value: product.materials },
          { label: "Colorway", value: product.colorway },
          {
            label: "Target Price",
            value: product.targetPrice
              ? `$${product.targetPrice.toFixed(2)}`
              : null,
          },
          { label: "Created by", value: product.createdBy?.name },
          {
            label: "Created",
            value: new Date(product.createdAt).toLocaleDateString(),
          },
          {
            label: "Last updated",
            value: new Date(product.updatedAt).toLocaleDateString(),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-1 text-sm font-medium">
              {item.value || <span className="text-gray-300">&mdash;</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Description */}
      {product.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold">Comments</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <button
              onClick={handleComment}
              disabled={posting || !comment.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Post
            </button>
          </div>
          {product.comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No comments yet
            </p>
          ) : (
            <div className="space-y-3">
              {product.comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{c.user.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity timeline */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold">Activity</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {product.activities.map((a) => (
            <div key={a.id} className="px-5 py-3">
              <p className="text-sm">{a.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
