import { db } from "@/lib/db";

export type LitterParentOption = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE";
};

/** Published, non-retired parents, plus the puppy's current dam/sire if they no longer qualify. */
export async function litterParentChoices(current?: {
  damId?: string | null;
  sireId?: string | null;
}): Promise<{ dams: LitterParentOption[]; sires: LitterParentOption[] }> {
  const extraIds = [current?.damId, current?.sireId].filter(
    (id): id is string => Boolean(id),
  );

  const parents = await db.parentDog.findMany({
    where: {
      OR: [
        { isPublished: true, isRetired: false },
        ...(extraIds.length ? [{ id: { in: extraIds } }] : []),
      ],
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, sex: true },
  });

  return {
    dams: parents.filter((p) => p.sex === "FEMALE"),
    sires: parents.filter((p) => p.sex === "MALE"),
  };
}
