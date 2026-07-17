/**
 * Import inventory + gallery URLs from the legacy McBride site content.
 * Images must already live under public/legacy/ (copied from reference folder).
 *
 * Usage: node scripts/import-legacy-content.mjs
 *
 * Does NOT touch admin password or OAuth users.
 */
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Sex,
  PuppyStatus,
  PhotoEntity,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

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
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const LEGACY = "/legacy";

/** @param {string[]} files @param {string} folder */
function photoUrls(folder, files) {
  return files.map((f, i) => ({
    url: `${LEGACY}/${folder}/${f}`,
    sortOrder: i,
    isPrimary: i === 0,
    alt: null,
  }));
}

const PARENTS = [
  {
    slug: "froggie",
    name: "Froggie",
    sex: Sex.FEMALE,
    color: "Black Phantom",
    weightLbs: 11,
    heightInches: 13,
    genetics: "Ee kyky Bb atat ssp",
    isRetired: false,
    sortOrder: 1,
    description:
      "Froggie is a black phantom dam at the heart of our program — compact, affectionate, and a devoted mother. Genes: Ee kyky Bb atat ssp.",
    photos: photoUrls("parents/froggie", [
      "froggie_01.webp",
      "froggie_02.webp",
      "froggie_03.webp",
      "froggie_04.webp",
    ]),
  },
  {
    slug: "arsibalt",
    name: "Arsibalt",
    sex: Sex.MALE,
    color: "Blue Merle",
    weightLbs: 20,
    heightInches: 15,
    genetics: null,
    isRetired: true,
    sortOrder: 2,
    description:
      "Arsibalt is a striking blue merle sire (retired). Known for producing beautiful merle puppies with sound structure and gentle temperaments.",
    photos: photoUrls("parents/arsibalt", [
      "20251130_arsibalt_01.webp",
      "20251130_arsibalt_02.webp",
      "20251130_arsibalt_03.webp",
      "20251130_arsibalt_04.webp",
    ]),
  },
  {
    slug: "bluey",
    name: "Bluey",
    sex: Sex.MALE,
    color: "Blue Merle",
    weightLbs: 11,
    heightInches: 13,
    genetics: null,
    isRetired: true,
    sortOrder: 3,
    description:
      "Bluey is a blue merle sire (retired) who contributed to our Quinn × Bluey litter — compact miniature size with classic merle coloring.",
    photos: photoUrls("parents/bluey", ["bluey_01.webp", "bluey_02.webp"]),
  },
  {
    slug: "bewilderbeast",
    name: "Bewilderbeast",
    sex: Sex.MALE,
    color: "Blue Merle",
    weightLbs: 6.5,
    heightInches: 10,
    genetics: "EE kyky BB atat ssp Mh268",
    isRetired: false,
    sortOrder: 4,
    description:
      "Bewilderbeast is a tiny blue merle sire with a big personality. Genes: EE kyky BB atat ssp Mh268.",
    photos: photoUrls("parents/bewilderbeast", [
      "bewilderbeast_01.webp",
      "bewilderbeast_02.webp",
      "bewilderbeast_03.webp",
      "bewilderbeast_04.webp",
      "bewilderbeast_05.webp",
    ]),
  },
  {
    slug: "louie",
    name: "King Louie",
    sex: Sex.MALE,
    color: "Red",
    weightLbs: 9,
    heightInches: 11,
    genetics: null,
    isRetired: true,
    sortOrder: 5,
    description:
      "King Louie is a red miniature sire (retired) — rich coat color and a classic, affectionate poodle temperament.",
    photos: photoUrls("parents/louie", [
      "louie_01.webp",
      "louie_02.webp",
      "louie_03.webp",
      "louie_04.webp",
      "louie_05.webp",
    ]),
  },
  {
    slug: "mary-puppins",
    name: "Mary Puppins",
    sex: Sex.FEMALE,
    color: "Parti",
    weightLbs: 16,
    heightInches: 14,
    genetics: "ee kbky bb atat spsp",
    isRetired: false,
    sortOrder: 6,
    description:
      "Mary Puppins is a parti dam with flashy markings. Genes: ee kbky bb atat spsp.",
    photos: photoUrls("parents/maryPuppins", ["maryPuppins_01.webp"]),
  },
  {
    slug: "penny",
    name: "Penny",
    sex: Sex.FEMALE,
    color: "Apricot Abstract",
    weightLbs: 7,
    heightInches: 11,
    genetics: "ee kyky Bb atat ssp",
    isRetired: false,
    sortOrder: 7,
    description:
      "Penny is a petite apricot abstract dam. Genes: ee kyky Bb atat ssp.",
    photos: photoUrls("parents/penny", [
      "penny_01.webp",
      "penny_02.webp",
      "penny_03.webp",
    ]),
  },
  {
    slug: "tootsie",
    name: "Tootsie",
    sex: Sex.FEMALE,
    color: "Brown Phantom",
    weightLbs: 12,
    heightInches: 13.5,
    genetics: "EE kyky bb atat ssp",
    isRetired: false,
    sortOrder: 8,
    description:
      "Tootsie is a brown phantom dam with a balanced build and sweet nature. Genes: EE kyky bb atat ssp.",
    photos: photoUrls("parents/tootsie", [
      "tootsie_01.webp",
      "tootsie_02.webp",
      "tootsie_03.webp",
    ]),
  },
  {
    slug: "sevro",
    name: "Sevro",
    sex: Sex.MALE,
    color: "Brown Merle",
    weightLbs: 6,
    heightInches: 10,
    genetics: "EE kyky bb ata ssp Mc+245M266",
    isRetired: false,
    sortOrder: 9,
    description:
      "Sevro is a brown merle toy/miniature sire — compact and full of character. Genes: EE kyky bb ata ssp Mc+245M266.",
    photos: photoUrls("parents/sevro", [
      "sevro_01.webp",
      "sevro_02.webp",
      "sevro_03.webp",
      "sevro_04.webp",
      "sevro_05.webp",
    ]),
  },
  {
    slug: "rusty",
    name: "Rusty",
    sex: Sex.MALE,
    color: "Red",
    weightLbs: 7,
    heightInches: 11,
    genetics: "ee kyky Bb ayat ss",
    isRetired: false,
    sortOrder: 10,
    description:
      "Rusty is a red miniature sire. Genes: ee kyky Bb ayat ss.",
    photos: photoUrls("parents/rusty", ["rusty_01.webp"]),
  },
  {
    slug: "quinn",
    name: "Quinn",
    sex: Sex.FEMALE,
    color: null,
    weightLbs: null,
    heightInches: null,
    genetics: null,
    isRetired: false,
    sortOrder: 11,
    description:
      "Quinn is the dam of our June 2025 Quinn × Bluey litter (Merlin and Sirius).",
    photos: [],
  },
];

const LITTERS = [
  {
    slug: "2025-07-31-froggie-arsibalt",
    name: "Froggie × Arsibalt",
    birthDate: new Date("2025-07-31"),
    damSlug: "froggie",
    sireSlug: "arsibalt",
    notes: "July 2025 litter — merles and apricot from Froggie and Arsibalt.",
  },
  {
    slug: "2025-06-27-quinn-bluey",
    name: "Quinn × Bluey",
    birthDate: new Date("2025-06-27"),
    damSlug: "quinn",
    sireSlug: "bluey",
    notes: "June 2025 litter — Merlin and Sirius.",
  },
];

const PUPPIES = [
  {
    slug: "pepper",
    name: "Pepper",
    sex: Sex.FEMALE,
    color: "Blue Merle",
    status: PuppyStatus.AVAILABLE,
    priceCents: 120000,
    priceLabel: null,
    birthDate: new Date("2025-07-31"),
    litterSlug: "2025-07-31-froggie-arsibalt",
    sortOrder: 1,
    description:
      "Pepper is a blue merle female from Froggie × Arsibalt (born July 31, 2025). Home-raised, socialized, and ready for her forever family.",
    photos: photoUrls("puppies/20250731_froggie_arsibalt", [
      "20251121_Pepper_01.webp",
      "20251121_Pepper_02.webp",
      "20251121_Pepper_03.webp",
      "20251121_Pepper_04.webp",
      "20251121_Pepper_05.webp",
    ]),
  },
  {
    slug: "severus",
    name: "Severus",
    sex: Sex.MALE,
    color: "Blue Merle",
    status: PuppyStatus.AVAILABLE,
    priceCents: 200000,
    priceLabel: null,
    birthDate: new Date("2025-07-31"),
    litterSlug: "2025-07-31-froggie-arsibalt",
    sortOrder: 2,
    description:
      "Severus is a blue merle male from Froggie × Arsibalt (born July 31, 2025). Handsome merle coat and a confident, friendly personality.",
    photos: photoUrls("puppies/20250731_froggie_arsibalt", [
      "20251121_Severus_01.webp",
      "20251121_Severus_02.webp",
      "20251121_Severus_03.webp",
      "20251121_Severus_04.webp",
    ]),
  },
  {
    slug: "luna",
    name: "Luna",
    sex: Sex.FEMALE,
    color: "Apricot",
    status: PuppyStatus.GUARDIANSHIP,
    priceCents: null,
    priceLabel: "Available for Guardianship",
    birthDate: new Date("2025-07-31"),
    litterSlug: "2025-07-31-froggie-arsibalt",
    sortOrder: 3,
    description:
      "Luna is an apricot female from Froggie × Arsibalt (born July 31, 2025). Available for guardianship — a special opportunity to raise a puppy in your home while supporting our breeding program.",
    photos: photoUrls("puppies/20250731_froggie_arsibalt", [
      "20251124_luna_01.webp",
      "20251124_luna_02.webp",
      "20251124_luna_03.webp",
      "20251124_luna_04.webp",
      "20251124_luna_05.webp",
      "20251124_luna_06.webp",
    ]),
  },
  {
    slug: "junebug",
    name: "Junebug",
    sex: Sex.FEMALE,
    color: "Blue Merle",
    status: PuppyStatus.AVAILABLE,
    priceCents: 150000,
    priceLabel: null,
    birthDate: new Date("2025-07-31"),
    litterSlug: "2025-07-31-froggie-arsibalt",
    sortOrder: 4,
    description:
      "Junebug is a blue merle female from Froggie × Arsibalt (born July 31, 2025). Playful and people-oriented — a wonderful companion prospect.",
    photos: photoUrls("puppies/20250731_froggie_arsibalt", [
      "20251124_junebug_01.webp",
      "20251124_junebug_02.webp",
      "20251124_junebug_03.webp",
      "20251124_junebug_04.webp",
    ]),
  },
  {
    slug: "bowie",
    name: "Bowie",
    sex: Sex.MALE,
    color: "Blue Merle",
    status: PuppyStatus.AVAILABLE,
    priceCents: 200000,
    priceLabel: null,
    birthDate: new Date("2025-07-31"),
    litterSlug: "2025-07-31-froggie-arsibalt",
    sortOrder: 5,
    description:
      "Bowie is a blue merle male from Froggie × Arsibalt (born July 31, 2025). Bold markings and a bright, curious temperament.",
    photos: photoUrls("puppies/20250731_froggie_arsibalt", [
      "20251125_bowie_01.webp",
      "20251125_bowie_02.webp",
      "20251125_bowie_03.webp",
      "20251125_bowie_04.webp",
      "20251125_bowie_05.webp",
      "20251125_bowie_06.webp",
    ]),
  },
  {
    slug: "sirius",
    name: "Sirius",
    sex: Sex.MALE,
    color: "Black Abstract",
    status: PuppyStatus.AVAILABLE,
    priceCents: 100000,
    priceLabel: null,
    birthDate: new Date("2025-06-27"),
    litterSlug: "2025-06-27-quinn-bluey",
    sortOrder: 6,
    description:
      "Sirius is a black abstract male from Quinn × Bluey (born June 27, 2025). Unique coat pattern and a sweet, steady disposition.",
    photos: photoUrls("puppies/20250627_quinn_bluey", [
      "20251125_sirius_01.webp",
      "20251125_sirius_02.webp",
      "20251125_sirius_03.webp",
      "20251125_sirius_04.webp",
      "20251125_sirius_05.webp",
      "20251125_sirius_06.webp",
    ]),
  },
  {
    slug: "merlin",
    name: "Merlin",
    sex: Sex.MALE,
    color: "Blue Merle",
    status: PuppyStatus.AVAILABLE,
    priceCents: 120000,
    priceLabel: null,
    birthDate: new Date("2025-06-27"),
    litterSlug: "2025-06-27-quinn-bluey",
    sortOrder: 7,
    description:
      "Merlin is a blue merle male from Quinn × Bluey (born June 27, 2025). Magical merle coat and an eager-to-please personality.",
    photos: photoUrls("puppies/20250627_quinn_bluey", [
      "20251124_merlin_01.webp",
      "20251124_merlin_02.webp",
      "20251124_merlin_03.webp",
      "20251124_merlin_04.webp",
      "20251124_merlin_05.webp",
    ]),
  },
];

async function replaceParentPhotos(parentDogId, photos, name) {
  await prisma.photo.deleteMany({
    where: { parentDogId, entityType: PhotoEntity.PARENT },
  });
  if (photos.length === 0) return;
  await prisma.photo.createMany({
    data: photos.map((p) => ({
      url: p.url,
      alt: p.alt ?? name,
      sortOrder: p.sortOrder,
      isPrimary: p.isPrimary,
      entityType: PhotoEntity.PARENT,
      parentDogId,
    })),
  });
}

async function replacePuppyPhotos(puppyId, photos, name) {
  await prisma.photo.deleteMany({
    where: { puppyId, entityType: PhotoEntity.PUPPY },
  });
  if (photos.length === 0) return;
  await prisma.photo.createMany({
    data: photos.map((p) => ({
      url: p.url,
      alt: p.alt ?? name,
      sortOrder: p.sortOrder,
      isPrimary: p.isPrimary,
      entityType: PhotoEntity.PUPPY,
      puppyId,
    })),
  });
}

async function main() {
  console.log("Importing legacy inventory + galleries…");

  const parentIds = {};
  for (const p of PARENTS) {
    const row = await prisma.parentDog.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sex: p.sex,
        color: p.color,
        weightLbs: p.weightLbs,
        heightInches: p.heightInches,
        genetics: p.genetics,
        description: p.description,
        isRetired: p.isRetired,
        isPublished: true,
        sortOrder: p.sortOrder,
      },
      create: {
        slug: p.slug,
        name: p.name,
        sex: p.sex,
        color: p.color,
        weightLbs: p.weightLbs,
        heightInches: p.heightInches,
        genetics: p.genetics,
        description: p.description,
        isRetired: p.isRetired,
        isPublished: true,
        sortOrder: p.sortOrder,
      },
    });
    parentIds[p.slug] = row.id;
    await replaceParentPhotos(row.id, p.photos, p.name);
    console.log(`  parent ${p.name} (${p.photos.length} photos)`);
  }

  const litterIds = {};
  for (const l of LITTERS) {
    const damId = parentIds[l.damSlug];
    const sireId = parentIds[l.sireSlug];
    if (!damId || !sireId) {
      throw new Error(`Missing parents for litter ${l.slug}`);
    }
    const row = await prisma.litter.upsert({
      where: { slug: l.slug },
      update: {
        name: l.name,
        birthDate: l.birthDate,
        notes: l.notes,
        damId,
        sireId,
        isPublished: true,
      },
      create: {
        slug: l.slug,
        name: l.name,
        birthDate: l.birthDate,
        notes: l.notes,
        damId,
        sireId,
        isPublished: true,
      },
    });
    litterIds[l.slug] = row.id;
    console.log(`  litter ${l.name}`);
  }

  for (const pup of PUPPIES) {
    const litterId = litterIds[pup.litterSlug];
    const row = await prisma.puppy.upsert({
      where: { slug: pup.slug },
      update: {
        name: pup.name,
        sex: pup.sex,
        color: pup.color,
        status: pup.status,
        priceCents: pup.priceCents,
        priceLabel: pup.priceLabel,
        description: pup.description,
        birthDate: pup.birthDate,
        litterId,
        isPublished: true,
        sortOrder: pup.sortOrder,
      },
      create: {
        slug: pup.slug,
        name: pup.name,
        sex: pup.sex,
        color: pup.color,
        status: pup.status,
        priceCents: pup.priceCents,
        priceLabel: pup.priceLabel,
        description: pup.description,
        birthDate: pup.birthDate,
        litterId,
        isPublished: true,
        sortOrder: pup.sortOrder,
      },
    });
    await replacePuppyPhotos(row.id, pup.photos, pup.name);
    console.log(`  puppy ${pup.name} (${pup.photos.length} photos)`);
  }

  // Site settings from old brochure
  const settings = [
    { key: "location", value: "Phoenix / Laveen, Arizona" },
    {
      key: "breeders",
      value: "Ralph & Janine McNeely",
    },
    {
      key: "about_tagline",
      value: "Breeding Miniature Poodle Companions • Phoenix, Arizona",
    },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Enrich welcome article if still seed-like
  await prisma.article.upsert({
    where: { slug: "welcome" },
    update: {
      title: "Welcome to McNeely Family Poodles",
      excerpt:
        "A boutique, family-run miniature poodle program in the Phoenix area — home-raised companions with lifetime support.",
      content: `Welcome to the McNeely ranch, a boutique, family-run poodle breeding home nestled in the heart of Laveen, AZ.

We began this adventure in 2022 when we realized we were absolutely crazy about poodles, and found the perfect piece of land to give them the very best life possible. Breeding poodles is not just a hobby — it's a lifestyle.

Our dogs romp across an acre of green pasture, swim in the pond our yard transforms into when we flood irrigate, and sleep on the furniture when it's cold. Every puppy is born in our home, raised underfoot, and socialized with kids, goats, and even the occasional delivery driver.

Our puppies are vet-checked, microchipped, vaccinated, and trained to use a potty pad and doggy door before they go home. Every puppy leaves with a lifetime promise: if life ever throws you a curveball and you can't keep your poodle, our home is always open.

Warmly,
McNeely Family Poodles`,
      isPublished: true,
      publishedAt: new Date(),
    },
    create: {
      slug: "welcome",
      title: "Welcome to McNeely Family Poodles",
      excerpt:
        "A boutique, family-run miniature poodle program in the Phoenix area — home-raised companions with lifetime support.",
      content: `Welcome to the McNeely ranch — home-raised miniature poodles with lifetime support.`,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log("Legacy import complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
