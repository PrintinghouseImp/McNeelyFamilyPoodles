import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, excerpt: true },
  });
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt ?? `${article.title} — ${SITE.name}`,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { slug, isPublished: true },
  });
  if (!article) notFound();

  return (
    <article className="container mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/articles"
        className="text-sm text-gray-500 transition hover:text-black"
      >
        ← All articles
      </Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-black">
        {article.title}
      </h1>
      {article.publishedAt ? (
        <p className="mt-2 text-sm text-gray-400">
          {formatDate(article.publishedAt)}
        </p>
      ) : null}

      {article.coverUrl ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200">
          <PhotoFrame src={article.coverUrl} alt={article.title} />
        </div>
      ) : null}

      {article.excerpt ? (
        <p className="mt-8 text-lg text-gray-600">{article.excerpt}</p>
      ) : null}

      <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-gray-700">
        {article.content}
      </div>
    </article>
  );
}
