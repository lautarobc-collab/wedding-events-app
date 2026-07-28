"use client";

import { useRef, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";

export function InlineEditable({
  editing,
  onStartEdit,
  onCancel,
  onCommit,
  display,
  children,
  className,
}: {
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onCommit: () => void;
  display: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      onCommit();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  if (!editing) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onStartEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter") onStartEdit();
        }}
        className={`cursor-text rounded px-1 -mx-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className ?? ""}`}
      >
        {display}
      </div>
    );
  }

  return (
    <div ref={containerRef} onBlur={handleBlur} onKeyDown={handleKeyDown} className={className}>
      {children}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">Enter para guardar · Esc para cancelar</p>
    </div>
  );
}
