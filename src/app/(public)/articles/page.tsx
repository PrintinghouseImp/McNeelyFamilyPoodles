import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Technical Articles",
  description:
    "Informational articles on poodle care, genetics, and breeding topics.",
};

export default async function ArticlesPage() {
  const articles = await db.article.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHero
        title="Technical Articles"
        subtitle="Genetics, care, and ranch knowledge"
      />
      <SectionShell>
        {articles.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-gray-500">
            Articles will appear here when published from the admin CMS.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
              >
                {a.coverUrl ? (
                  <PhotoFrame src={a.coverUrl} alt={a.title} />
                ) : (
                  <div className="photo-frame min-h-[8rem]">
                    <span className="py-8 text-sm text-gray-400">Article</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-semibold text-black group-hover:underline">
                    {a.title}
                  </h2>
                  {a.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                      {a.excerpt}
                    </p>
                  ) : null}
                  <p className="mt-auto pt-4 text-xs text-gray-400">
                    {formatDate(a.publishedAt) ?? ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionShell>
    </>
  );
}
