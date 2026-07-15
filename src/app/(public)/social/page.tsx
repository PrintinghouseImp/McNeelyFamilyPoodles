import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "Social",
  description: `Follow ${SITE.name} on Instagram and Facebook.`,
};

const PLACEHOLDER_POSTS = [
  {
    id: "placeholder-1",
    platform: "Instagram",
    caption:
      "Placeholder post — puppies in the play yard. Replace with a real Instagram URL and caption from admin.",
    imageUrl: null as string | null,
    postUrl: null as string | null,
    postedAt: null as Date | null,
  },
  {
    id: "placeholder-2",
    platform: "Facebook",
    caption:
      "Placeholder post — meet our latest litter highlights. Curated posts will appear here once published.",
    imageUrl: null as string | null,
    postUrl: null as string | null,
    postedAt: null as Date | null,
  },
  {
    id: "placeholder-3",
    platform: "Instagram",
    caption:
      "Placeholder post — life on the ranch. No live Meta feed required in v1.",
    imageUrl: null as string | null,
    postUrl: null as string | null,
    postedAt: null as Date | null,
  },
] as const;

function platformLabel(platform: string) {
  const p = platform.trim().toLowerCase();
  if (p.includes("insta")) return "Instagram";
  if (p.includes("face")) return "Facebook";
  return platform || "Social";
}

export default async function SocialPage() {
  const [settings, posts] = await Promise.all([
    db.siteSetting.findMany({
      where: { key: { in: ["instagram_url", "facebook_url"] } },
    }),
    db.socialPost.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { postedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const settingMap = Object.fromEntries(
    settings.map((s) => [s.key, s.value.trim()]),
  );
  const instagramUrl = settingMap.instagram_url || "";
  const facebookUrl = settingMap.facebook_url || "";

  const hasCurated = posts.length > 0;
  const feed = hasCurated
    ? posts.map((p) => ({
        id: p.id,
        platform: platformLabel(p.platform),
        caption: p.caption,
        imageUrl: p.imageUrl,
        postUrl: p.postUrl,
        postedAt: p.postedAt,
      }))
    : PLACEHOLDER_POSTS.map((p) => ({ ...p }));

  return (
    <>
      <PageHero
        title="Social"
        subtitle="Follow along on Instagram and Facebook"
      />
      <SectionShell>
        <div className="mx-auto mb-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          <SocialProfileLink
            label="Instagram"
            href={instagramUrl}
            description="Photos and reels from the ranch"
          />
          <SocialProfileLink
            label="Facebook"
            href={facebookUrl}
            description="Updates for families and friends"
          />
        </div>

        <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-black">
              {hasCurated ? "Recent posts" : "Featured highlights"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {hasCurated
                ? "Curated posts managed by the breeder (no live Meta firehose required)."
                : "Placeholder cards until curated posts are published in admin."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {feed.map((post) => (
            <article
              key={post.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              {post.imageUrl ? (
                <div className="photo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={
                      post.caption?.slice(0, 80) || `${post.platform} post`
                    }
                    className="photo-img"
                  />
                </div>
              ) : (
                <div className="photo-frame min-h-[10rem]" aria-hidden>
                  <span className="py-12 text-sm font-medium text-gray-400">
                    {post.platform}
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {post.platform}
                  </span>
                  {post.postedAt ? (
                    <time
                      dateTime={post.postedAt.toISOString()}
                      className="text-xs text-gray-400"
                    >
                      {formatDate(post.postedAt, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  ) : null}
                </div>
                {post.caption ? (
                  <p className="line-clamp-4 text-sm text-gray-700">
                    {post.caption}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No caption.</p>
                )}
                {post.postUrl ? (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-2 text-sm text-gray-500 transition hover:text-black"
                  >
                    View on {post.platform} →
                  </a>
                ) : (
                  <p className="mt-auto pt-2 text-xs text-gray-400">
                    Link available when a post URL is added
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {!hasCurated ? (
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-gray-400">
            Live Instagram/Facebook auto-feeds need Meta app setup later. For
            now, profile buttons use{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-600">
              SiteSetting
            </code>{" "}
            and cards use{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-600">
              SocialPost
            </code>{" "}
            (or these placeholders).
          </p>
        ) : null}
      </SectionShell>
    </>
  );
}

function SocialProfileLink({
  label,
  href,
  description,
}: {
  label: string;
  href: string;
  description: string;
}) {
  const valid =
    href.startsWith("http://") || href.startsWith("https://");
  const isPlaceholder =
    !valid ||
    href === "https://instagram.com/" ||
    href === "https://facebook.com/" ||
    href === "https://www.instagram.com/" ||
    href === "https://www.facebook.com/";

  const className =
    "flex flex-col rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-300 hover:shadow-sm";

  const body = (
    <>
      <span className="text-base font-semibold text-black">{label}</span>
      <span className="mt-1 text-sm text-gray-500">{description}</span>
      <span className="mt-3 text-sm text-gray-500">
        {isPlaceholder ? "Add your profile URL in site settings" : `Open ${label} →`}
      </span>
    </>
  );

  if (!isPlaceholder && valid) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {body}
      </a>
    );
  }

  return (
    <div className={`${className} opacity-90`}>
      {body}
      <Link
        href="/about"
        className="mt-2 text-xs text-gray-400 hover:text-black"
      >
        Learn about us on About →
      </Link>
    </div>
  );
}
