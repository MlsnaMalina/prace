import { SKORE_PASMA, SKORE_PASMO_KLICE } from "@/lib/filters";
import type { SkorePasmoKlic } from "@/lib/filters";
import { HODNOCENI_STAV_LABELS } from "@/lib/types";
import type { HodnoceniStav } from "@/lib/types";

type Tone =
  | "horsi"
  | "stejne"
  | "lepsi"
  | "pasmo-vysoke"
  | "pasmo-dobre"
  | "pasmo-stredni"
  | "pasmo-nizke"
  | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  horsi: "bg-horsi/10 text-horsi border-horsi/30",
  stejne: "bg-stejne/10 text-stejne border-stejne/30",
  lepsi: "bg-lepsi/10 text-lepsi border-lepsi/30",
  "pasmo-vysoke": "bg-pasmo-vysoke/10 text-pasmo-vysoke border-pasmo-vysoke/30",
  "pasmo-dobre": "bg-pasmo-dobre/10 text-pasmo-dobre border-pasmo-dobre/30",
  "pasmo-stredni": "bg-pasmo-stredni/10 text-pasmo-stredni border-pasmo-stredni/30",
  "pasmo-nizke": "bg-pasmo-nizke/10 text-pasmo-nizke border-pasmo-nizke/30",
  neutral: "bg-gray-100 text-gray-700 border-gray-300",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

function skorePasmoKlic(skore: number): SkorePasmoKlic {
  for (const klic of SKORE_PASMO_KLICE) {
    if (skore >= SKORE_PASMA[klic].min) return klic;
  }
  return "0";
}

const TONE_PODLE_PASMA: Record<SkorePasmoKlic, Tone> = {
  "85": "pasmo-vysoke",
  "70": "pasmo-dobre",
  "50": "pasmo-stredni",
  "0": "pasmo-nizke",
};

export function SkoreBadge({ skore }: { skore: number }) {
  const klic = skorePasmoKlic(skore);
  return (
    <Badge tone={TONE_PODLE_PASMA[klic]}>
      <span className="font-semibold">{skore}</span>
    </Badge>
  );
}

export function HodnoceniBadge({ stav }: { stav: HodnoceniStav }) {
  return <Badge tone={stav}>{HODNOCENI_STAV_LABELS[stav]}</Badge>;
}
