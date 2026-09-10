import { formatHomeOffice, formatPlat, formatPruznaDoba } from "@/lib/format";
import { PRACOVNI_CESTY_LABELS, ZDROJ_LABELS } from "@/lib/types";
import type { Nabidka } from "@/lib/types";

function Radek({ label, hodnota }: { label: string; hodnota: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right text-gray-900">{hodnota}</span>
    </div>
  );
}

export function OstatniUdaje({ nabidka }: { nabidka: Nabidka }) {
  return (
    <div className="flex flex-col divide-y divide-gray-100 border border-gray-200 px-4">
      {nabidka.adresa && <Radek label="Adresa" hodnota={nabidka.adresa} />}
      <Radek
        label="Plat"
        hodnota={formatPlat(nabidka.plat_od, nabidka.plat_do, nabidka.plat_uveden)}
      />
      <Radek label="Home office" hodnota={formatHomeOffice(nabidka.home_office_dny)} />
      <Radek label="Pružná doba" hodnota={formatPruznaDoba(nabidka.pruzna_doba)} />
      <Radek
        label="Pracovní cesty"
        hodnota={PRACOVNI_CESTY_LABELS[nabidka.pracovni_cesty]}
      />
      {nabidka.zdroj && <Radek label="Zdroj" hodnota={ZDROJ_LABELS[nabidka.zdroj]} />}
      {nabidka.stitky && nabidka.stitky.length > 0 && (
        <Radek label="Štítky" hodnota={nabidka.stitky.join(", ")} />
      )}
    </div>
  );
}
