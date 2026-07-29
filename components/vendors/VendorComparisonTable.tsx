import { formatMoney } from "@/lib/format";
import { VENDOR_STATUS_LABEL, type Vendor } from "@/lib/types";

const ROWS: { label: string; render: (vendor: Vendor) => string }[] = [
  { label: "Estado", render: (v) => VENDOR_STATUS_LABEL[v.status] },
  { label: "Estimado", render: (v) => (v.estimated != null ? formatMoney(v.estimated) : "—") },
  { label: "Real", render: (v) => (v.actual != null ? formatMoney(v.actual) : "—") },
  { label: "Teléfono", render: (v) => v.contact_phone ?? "—" },
  { label: "Email", render: (v) => v.contact_email ?? "—" },
  { label: "Web", render: (v) => v.website ?? "—" },
  { label: "Notas", render: (v) => v.notes ?? "—" },
];

export function VendorComparisonTable({ vendors }: { vendors: Vendor[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left"></th>
            {vendors.map((vendor) => (
              <th key={vendor.id} className="p-2 text-left font-medium">
                {vendor.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-neutral-200 dark:border-neutral-800">
              <td className="p-2 text-neutral-500 dark:text-neutral-400">{row.label}</td>
              {vendors.map((vendor) => (
                <td key={vendor.id} className="p-2">
                  {row.render(vendor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
