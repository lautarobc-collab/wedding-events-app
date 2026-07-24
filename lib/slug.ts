export function generateSlug(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const suffix = crypto.randomUUID().slice(0, 8);

  return base ? `${base}-${suffix}` : suffix;
}
