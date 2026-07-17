import Link from "next/link";
import { createMedicalRecord } from "@/app/admin/actions/medical";
import {
  btnSecondary,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Admin · New medical record" };

type Props = {
  searchParams: Promise<{ parent?: string; puppy?: string }>;
};

const TITLE_HINTS = [
  "Health Summary",
  "Microchip",
  "Vet Wellness Exam",
];

export default async function NewMedicalRecordPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const [parents, puppies] = await Promise.all([
    db.parentDog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sex: true } }),
    db.puppy.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true } }),
  ]);

  const defaultTarget = params.parent
    ? `parent:${params.parent}`
    : params.puppy
      ? `puppy:${params.puppy}`
      : "";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/medical"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All medical records
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Add medical record
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Give every upload a clear <strong className="font-medium text-gray-700">title/label</strong>{" "}
        (what the document is). Prefill suggestions: Health Summary, Microchip, Vet Wellness Exam.
        Attach a PDF or a scanned photo from your phone.
      </p>

      <form
        action={createMedicalRecord}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <Field
          label="Title / label"
          hint="Required. Examples: Health Summary, Microchip, Genetic panel, etc"
        >
          <input
            name="title"
            required
            className={inputClass}
            list="medical-title-hints"
            placeholder="Examples: Health Summary, Microchip, Genetic panel, etc"
          />
          <datalist id="medical-title-hints">
            {TITLE_HINTS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>

        <Field label="Record date" hint="Date on the document or exam date">
          <input name="recordDate" type="date" className={inputClass} />
        </Field>

        <Field label="Dog" hint="Attach to exactly one parent or puppy">
          <select
            name="target"
            required
            className={selectClass}
            defaultValue={defaultTarget}
          >
            <option value="" disabled>
              Select dog…
            </option>
            <optgroup label="Parents (sires & dams)">
              {parents.map((p) => (
                <option key={p.id} value={`parent:${p.id}`}>
                  {p.name} ({p.sex === "MALE" ? "Sire" : "Dam"})
                </option>
              ))}
            </optgroup>
            <optgroup label="Puppies">
              {puppies.map((p) => (
                <option key={p.id} value={`puppy:${p.id}`}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>

        <Field
          label="File (PDF or scan)"
          hint="PDF, JPEG, PNG, WebP, or HEIC · max 10 MB · camera capture supported on phones"
        >
          <input
            type="file"
            name="file"
            accept="application/pdf,image/*,.pdf"
            capture="environment"
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200"
          />
        </Field>

        <Field label="Notes" hint="Admin-only notes (not shown publicly)">
          <textarea name="notes" className={textareaClass} />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton pendingLabel="Saving…">Save medical record</SubmitButton>
          <Link href="/admin/medical" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
