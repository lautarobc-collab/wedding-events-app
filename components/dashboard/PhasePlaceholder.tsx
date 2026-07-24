export function PhasePlaceholder({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-neutral-500">Llega en la Fase {phase}.</p>
    </div>
  );
}
