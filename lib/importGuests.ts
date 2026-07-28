export type ParsedGuestRow = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  invited_by: string | null;
};

const HEADER_FIRST_CELL = /^(nombre|first_?name)$/i;

function detectDelimiter(raw: string): string {
  const semicolons = (raw.match(/;/g) ?? []).length;
  const commas = (raw.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

// Formato esperado: Nombre;Apellidos;Email;Invitado por (o con comas), una
// fila por invitado. Solo el nombre es obligatorio; el resto puede faltar.
export function parseGuestCsv(raw: string): { rows: ParsedGuestRow[]; skipped: number } {
  const delimiter = detectDelimiter(raw);
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const rows: ParsedGuestRow[] = [];
  let skipped = 0;

  lines.forEach((line, index) => {
    const cells = line.split(delimiter).map((cell) => cell.trim());
    if (index === 0 && HEADER_FIRST_CELL.test(cells[0] ?? "")) return;

    const first_name = cells[0] ?? "";
    if (!first_name) {
      skipped += 1;
      return;
    }

    rows.push({
      first_name,
      last_name: cells[1] || null,
      email: cells[2] || null,
      invited_by: cells[3] || null,
    });
  });

  return { rows, skipped };
}
