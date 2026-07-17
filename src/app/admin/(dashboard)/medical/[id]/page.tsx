import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteMedicalRecord,
  updateMedicalRecord } from "@/app/admin/actions/medical";
import { MedicalFilePreview } from "@/components/admin/medical-file-preview";
import {
  btnDanger,
  btnSecondary,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const record = await db.medicalRecord.findUnique({ where: { id } });
  return {
    title: record ? `Admin · ${record.title}` : "Admin · Medical record" };
}

const TITLE_HINTS = [
  "Health Summary",
  "Microchip",
  "Vet Wellness Exam",
];

export default async function EditMedicalRecordPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [record, parents, puppies] = await Promise.all([
    db.medicalRecord.findUnique({
      where: { id },
      include: {
        parentDog: { select: { id: true, name: true } },
        puppy: { select: { id: true, name: true } } } }),
    db.parentDog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sex: true } }),
    db.puppy.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true } }),
  ]);

  if (!record) notFound();

  const defaultTarget = record.parentDogId
    ? `parent:${record.parentDogId}`
    : record.puppyId
      ? `puppy:${record.puppyId}`
      : "";
  const dateValue = record.recordDate
    ? record.recordDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/medical"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All medical records
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {record.title}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {record.parentDog
          ? `Parent · ${record.parentDog.name}`
          : record.puppy
            ? `Puppy · ${record.puppy.name}`
            : "Unassigned"}
        {record.recordDate
          ? ` · ${formatDate(record.recordDate)}`
          : null}
      </p>

      {record.fileUrl ? (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Attached file
          </h2>
          <MedicalFilePreview fileUrl={record.fileUrl} title={record.title} />
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
          No file attached yet. Upload a PDF or scanned image below.
        </p>
      )}

      <form
        action={updateMedicalRecord}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={record.id} />

        <Field
          label="Title / label"
          hint="Required. Examples: Health Summary, Microchip, Genetic panel, etc"
        >
          <input
            name="title"
            required
            defaultValue={record.title}
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

        <Field label="Record date">
          <input
            name="recordDate"
            type="date"
            defaultValue={dateValue}
            className={inputClass}
          />
        </Field>

        <Field label="Dog">
          <select
            name="target"
            required
            className={selectClass}
            defaultValue={defaultTarget}
          >
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
          label="Replace file (PDF or scan)"
          hint="Leave empty to keep the current file. Max 10 MB."
        >
          <input
            type="file"
            name="file"
            accept="application/pdf,image/*,.pdf"
            capture="environment"
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200"
          />
        </Field>

        {record.fileUrl ? (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="removeFile" value="1" className="h-4 w-4" />
            Remove current file without replacing
          </label>
        ) : null}

        <Field label="Notes">
          <textarea
            name="notes"
            defaultValue={record.notes ?? ""}
            className={textareaClass}
          />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton>Save changes</SubmitButton>
          <Link href="/admin/medical" className={btnSecondary}>
            Back to list
          </Link>
        </div>
      </form>

      <form
        action={deleteMedicalRecord}
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6"
      >
        <input type="hidden" name="id" value={record.id} />
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deletes this medical record and its uploaded file.
        </p>
        <button type="submit" className={`${btnDanger} mt-4`}>
          Delete record
        </button>
      </form>
    </div>
  );
}
