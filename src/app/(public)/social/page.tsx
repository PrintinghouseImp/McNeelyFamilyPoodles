import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { DEFAULT_SOCIAL_IMAGES, SITE } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import {
  getSocialProfiles,
  isLiveSocialUrl,
  type SocialProfile,
} from "@/lib/settings";

export const metadata = {
  title: "Social",
  description: `Follow ${SITE.name} on Instagram and Facebook — ranch photos, litter updates, and life with our miniature poodles.`,
};

function platformLabel(platform: string) {
  const p = platform.trim().toLowerCase();
  if (p.includes("insta")) return "Instagram";
  if (p.includes("face")) return "Facebook";
  return platform || "Social";
}

function fallbackPostImage(index: number) {
  const list = DEFAULT_SOCIAL_IMAGES.posts;
  return list[index % list.length];
}

export default async function SocialPage() {
  const [profiles, posts] = await Promise.all([
    getSocialProfiles(),
    db.socialPost.findMany({
      where: { isPublished: true },
      orderBy: [
        { sortOrder: "asc" },
        { postedAt: "desc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const profileCards: SocialProfile[] = [profiles.instagram, profiles.facebook];

  return (
    <>
      <PageHero
        title="Follow along"
        subtitle="Ranch life, litter updates, and miniature poodles — on Instagram and Facebook"
      />
      <SectionShell>
        <div className="mx-auto mb-16 grid max-w-3xl gap-6 sm:grid-cols-2">
          {profileCards.map((profile) => (
            <SocialProfileCard key={profile.platform} profile={profile} />
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-black">
            From the ranch
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            A few favorite posts. Follow us for the full feed.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
            New photos will appear here as we share them. In the meantime,
            follow along on Instagram or Facebook above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => {
              const platform = platformLabel(post.platform);
              const imageUrl = post.imageUrl || fallbackPostImage(index);
              const live = isLiveSocialUrl(post.postUrl);
              const caption = post.caption?.trim() || "";
              const dateLabel = formatDate(post.postedAt, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const body = (
                <>
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={caption.slice(0, 80) || `${platform} post from ${SITE.name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600">
                        {platform}
                      </span>
                      {dateLabel ? (
                        <time
                          dateTime={
                            post.postedAt
                              ? post.postedAt.toISOString()
                              : undefined
                          }
                          className="text-xs text-gray-400"
                        >
                          {dateLabel}
                        </time>
                      ) : null}
                    </div>
                    {caption ? (
                      <p className="line-clamp-3 text-sm leading-relaxed text-gray-700">
                        {caption}
                      </p>
                    ) : null}
                  </div>
                </>
              );

              const cardClass =
                "group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm";

              if (live) {
                return (
                  <a
                    key={post.id}
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {body}
                  </a>
                );
              }

              return (
                <article key={post.id} className={cardClass}>
                  {body}
                </article>
              );
            })}
          </div>
        )}
      </SectionShell>
    </>
  );
}

function SocialProfileCard({ profile }: { profile: SocialProfile }) {
  const cardClass =
    "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white";

  const inner = (
    <>
      <div className="aspect-square overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.imageUrl}
          alt={`${SITE.name} on ${profile.platform}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col items-start gap-4 p-5">
        <h2 className="text-lg font-semibold tracking-tight text-black">
          {profile.platform}
        </h2>
        {profile.isLive ? (
          <span className="inline-flex rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition group-hover:bg-gray-900">
            Follow
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-400">
            Follow
          </span>
        )}
      </div>
    </>
  );

  if (profile.isLive) {
    return (
      <a
        href={profile.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClass} group transition hover:border-gray-300 hover:shadow-sm`}
      >
        {inner}
      </a>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}
