import Link from "next/link";
import { Badge, SkoreBadge } from "../ui/Badge";
import { QuickStavActions } from "./QuickStavActions";
import { STAV_LABELS } from "@/lib/types";
import { dnesVPraze, dnyMezi, formatDatum } from "@/lib/format";
import type { Nabidka } from "@/lib/types";

const DNI_BEZ_REAKCE_PRAH = 7;

type Radek = Pick<
  Nabidka,
  | "id"
  | "skore"
  | "pozice"
  | "firma"
  | "lokalita"
  | "nalezeno_dne"
  | "stitky"
  | "stav"
  | "datum_reakce"
>;

export function NabidkaListItem({ nabidka }: { nabidka: Radek }) {
  const jeAktivni = nabidka.stav === "novy" || nabidka.stav === "k_zvazeni";
  const bezReakce =
    jeAktivni &&
    !nabidka.datum_reakce &&
    dnyMezi(nabidka.nalezeno_dne, dnesVPraze()) >= DNI_BEZ_REAKCE_PRAH;

  return (
    <li className="border border-gray-200 px-4 py-3 hover:border-gray-400">
      <Link href={`/nabidky/${nabidka.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <SkoreBadge skore={nabidka.skore} />
            <div className="min-w-0">
              <div className="font-medium text-gray-900">{nabidka.pozice}</div>
              <div className="truncate text-sm text-gray-600">
                {nabidka.firma}
                {nabidka.lokalita ? ` · ${nabidka.lokalita}` : ""}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right text-xs text-gray-500">
            {formatDatum(nabidka.nalezeno_dne)}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{STAV_LABELS[nabidka.stav]}</Badge>
          {nabidka.datum_reakce && (
            <span className="text-xs text-gray-500">
              reagováno {formatDatum(nabidka.datum_reakce)}
            </span>
          )}
          {bezReakce && <Badge tone="horsi">bez reakce</Badge>}
          {(nabidka.stitky ?? []).map((s) => (
            <span
              key={s}
              className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500"
            >
              {s}
            </span>
          ))}
        </div>
      </Link>
      <div className="mt-2 flex items-center border-t border-gray-100 pt-2">
        <QuickStavActions id={nabidka.id} />
      </div>
    </li>
  );
}
