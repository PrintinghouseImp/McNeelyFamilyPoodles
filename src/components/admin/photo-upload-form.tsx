"use client";

import { useState } from "react";
import { uploadPhoto } from "@/app/admin/actions/photos";
import { btnPrimary, checkClass, inputClass } from "@/components/admin/field";

const idleButton =
  "inline-flex cursor-not-allowed items-center justify-center rounded-full bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500";

export function PhotoUploadForm({
  entityType,
  entityId,
}: {
  entityType: "PARENT" | "PUPPY" | "LITTER";
  entityId: string;
}) {
  const [hasFile, setHasFile] = useState(false);

  return (
    <form
      action={uploadPhoto}
      className="mt-6 space-y-4 border-b border-gray-100 pb-6"
      onSubmit={(event) => {
        if (!hasFile) event.preventDefault();
      }}
    >
      <input type="hidden" name="entityType" value={entityType} />
      <input type="hidden" name="entityId" value={entityId} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Add photo
        </label>
        <input
          type="file"
          name="file"
          accept="image/*"
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200"
          onChange={(event) => setHasFile(Boolean(event.target.files?.[0]))}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Alt text (optional)
        </label>
        <input
          type="text"
          name="alt"
          className={inputClass}
          placeholder="Describe the photo"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="isPrimary" className={checkClass} />
        Set as hero photo
      </label>
      <button
        type="submit"
        className={hasFile ? btnPrimary : idleButton}
        disabled={!hasFile}
        aria-disabled={!hasFile}
      >
        Upload photo
      </button>
    </form>
  );
}
