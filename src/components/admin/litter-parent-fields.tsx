import { Field, selectClass } from "@/components/admin/field";
import type { LitterParentOption } from "@/lib/litter-parents";

export function LitterParentFields({
  dams,
  sires,
  damId,
  sireId,
}: {
  dams: LitterParentOption[];
  sires: LitterParentOption[];
  damId?: string | null;
  sireId?: string | null;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Dam" hint="Published females who are not retired">
        <select
          name="damId"
          className={selectClass}
          defaultValue={damId ?? ""}
        >
          <option value="">No dam</option>
          {dams.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sire" hint="Published males who are not retired">
        <select
          name="sireId"
          className={selectClass}
          defaultValue={sireId ?? ""}
        >
          <option value="">No sire</option>
          {sires.map((dog) => (
            <option key={dog.id} value={dog.id}>
              {dog.name}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
