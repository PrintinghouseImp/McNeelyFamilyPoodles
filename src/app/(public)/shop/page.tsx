import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";

export const metadata = {
  title: "Shop",
  description:
    "Recommended products and items from McNeely Family Poodles.",
};

export default async function ShopPage() {
  const items = await db.shopItem.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  return (
    <>
      <PageHero title="Shop" subtitle="Sponsored picks and ranch favorites" />
      <SectionShell>
        {items.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-gray-500">
            Shop items will appear here when published from the admin CMS.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const photo = item.photos[0];
              const card = (
                <>
                  {photo ? (
                    <PhotoFrame src={photo.url} alt={item.title} />
                  ) : (
                    <div className="photo-frame min-h-[8rem]">
                      <span className="py-8 text-sm text-gray-400">
                        {item.type === "AFFILIATE" ? "Affiliate" : "Product"}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {item.type === "AFFILIATE" ? "Affiliate" : "Product"}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-black">
                      {item.title}
                    </h2>
                    {item.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                        {item.description}
                      </p>
                    ) : null}
                    {item.priceCents != null ? (
                      <p className="mt-3 text-sm font-medium text-gray-700">
                        {formatPriceCents(item.priceCents)}
                      </p>
                    ) : null}
                    {item.url ? (
                      <p className="mt-auto pt-4 text-sm text-gray-500">
                        View →
                      </p>
                    ) : null}
                  </div>
                </>
              );

              const className =
                "group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm";

              return item.url ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {card}
                </a>
              ) : (
                <div key={item.id} className={className}>
                  {card}
                </div>
              );
            })}
          </div>
        )}
      </SectionShell>
    </>
  );
}
