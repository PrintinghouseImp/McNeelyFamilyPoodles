import "dotenv/config";
import { hash } from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Sex,
  PuppyStatus,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

// node-pg treats sslmode=require as verify-full; Supabase pooler needs relaxed TLS.
const isSupabase = connectionString.includes("supabase.co");
const url = isSupabase
  ? connectionString
      .replace(/([?&])sslmode=[^&]*/g, "$1")
      .replace(/[?&]$/, "")
      .replace(/\?&/, "?")
  : connectionString;
const pool = new Pool({
  connectionString: url,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = (
    process.env.ADMIN_EMAIL ?? "admin@mcneelyfamilypoodles.com"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-me-after-seed";
  const name = process.env.ADMIN_NAME ?? "Site Admin";

  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: UserRole.ADMIN },
    create: {
      email,
      name,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const froggie = await prisma.parentDog.upsert({
    where: { slug: "froggie" },
    update: {},
    create: {
      slug: "froggie",
      name: "Froggie",
      sex: Sex.FEMALE,
      color: "Black Phantom",
      weightLbs: 11,
      heightInches: 13,
      genetics: "Ee kyky Bb atat ssp",
      isPublished: true,
      sortOrder: 1,
    },
  });

  const arsibalt = await prisma.parentDog.upsert({
    where: { slug: "arsibalt" },
    update: {},
    create: {
      slug: "arsibalt",
      name: "Arsibalt",
      sex: Sex.MALE,
      color: "Blue Merle",
      weightLbs: 20,
      heightInches: 15,
      isRetired: true,
      isPublished: true,
      sortOrder: 2,
    },
  });

  const litter = await prisma.litter.upsert({
    where: { slug: "2025-07-31-froggie-arsibalt" },
    update: {},
    create: {
      slug: "2025-07-31-froggie-arsibalt",
      name: "Froggie × Arsibalt",
      birthDate: new Date("2025-07-31"),
      damId: froggie.id,
      sireId: arsibalt.id,
      isPublished: true,
    },
  });

  await prisma.puppy.upsert({
    where: { slug: "pepper" },
    update: {},
    create: {
      slug: "pepper",
      name: "Pepper",
      sex: Sex.FEMALE,
      color: "Blue Merle",
      status: PuppyStatus.AVAILABLE,
      priceCents: 120000,
      birthDate: new Date("2025-07-31"),
      litterId: litter.id,
      isPublished: true,
      description: "Sample seed puppy — replace with live inventory.",
    },
  });

  await prisma.article.upsert({
    where: { slug: "welcome" },
    update: {},
    create: {
      slug: "welcome",
      title: "Welcome to McNeely Family Poodles",
      excerpt: "Informational articles for families and enthusiasts.",
      content:
        "This is a seed technical article. Publish genetics and care guides from admin.",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  const settings: { key: string; value: string }[] = [
    { key: "location", value: "Phoenix, Arizona" },
    {
      key: "instagram_url",
      value: process.env.INSTAGRAM_URL ?? "https://instagram.com/",
    },
    {
      key: "facebook_url",
      value: process.env.FACEBOOK_URL ?? "https://facebook.com/",
    },
    { key: "venmo_handle", value: process.env.VENMO_HANDLE ?? "" },
    { key: "zelle_contact", value: process.env.ZELLE_CONTACT ?? "" },
    { key: "paypal_me_url", value: process.env.PAYPAL_ME_URL ?? "" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Optional sample curated posts (skip if any already exist)
  const socialCount = await prisma.socialPost.count();
  if (socialCount === 0) {
    await prisma.socialPost.createMany({
      data: [
        {
          platform: "Instagram",
          postUrl: "https://instagram.com/",
          caption:
            "Sample curated post — puppies in the play yard. Replace with a real post URL from admin.",
          isPublished: true,
          sortOrder: 1,
          postedAt: new Date("2025-08-15"),
        },
        {
          platform: "Facebook",
          postUrl: "https://facebook.com/",
          caption:
            "Sample curated post — Froggie × Arsibalt litter update. Managed in SocialPost, not a live Meta API feed.",
          isPublished: true,
          sortOrder: 2,
          postedAt: new Date("2025-09-01"),
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log(`Admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
