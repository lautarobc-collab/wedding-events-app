"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteVendorAttachment,
  uploadVendorAttachment,
} from "@/app/(dashboard)/eventos/[id]/proveedores/actions";
import { formatBytes } from "@/lib/format";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import type { VendorAttachment } from "@/lib/types";

export function VendorAttachments({
  eventId,
  vendorId,
  attachments,
  signedUrlByPath,
}: {
  eventId: string;
  vendorId: string;
  attachments: VendorAttachment[];
  signedUrlByPath: Map<string, string>;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: FormEvent) {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setError(null);
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadVendorAttachment(vendorId, eventId, formData);
    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1 border-t border-neutral-100 dark:border-neutral-800 pt-2">
      {attachments.length > 0 && (
        <ul className="flex flex-col gap-1">
          {attachments.map((attachment) => {
            const url = signedUrlByPath.get(attachment.file_path);
            return (
              <li key={attachment.id} className="flex items-center justify-between gap-2 text-xs">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                    {attachment.file_name}
                  </a>
                ) : (
                  <span>{attachment.file_name}</span>
                )}
                <span className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                  {formatBytes(attachment.size_bytes)}
                  <ConfirmDeleteButton
                    label="Borrar"
                    pendingLabel="Borrando..."
                    className="text-red-600 dark:text-red-400 underline disabled:opacity-50"
                    confirmMessage={`¿Eliminar "${attachment.file_name}"?`}
                    onConfirm={async () => {
                      await deleteVendorAttachment(attachment.id, attachment.file_path, eventId);
                      router.refresh();
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleUpload} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="text-xs"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 text-xs underline disabled:opacity-50"
        >
          {isSubmitting ? "Subiendo..." : "Adjuntar"}
        </button>
      </form>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
