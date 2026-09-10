import { dnesVPraze, dnyMezi } from "./format";
import { STAV_NABIDKY } from "./types";
import type { StavNabidky } from "./types";

const DNI_BEZ_REAKCE_PRAH = 7;

export type Souhrn = {
  celkem: number;
  novychTyden: number;
  podleStavu: Record<StavNabidky, number>;
  bezReakce: number;
};

type SouhrnRadek = {
  stav: string;
  nalezeno_dne: string;
  datum_reakce: string | null;
};

export function spocitatSouhrn(radky: SouhrnRadek[]): Souhrn {
  const dnes = dnesVPraze();
  const podleStavu = Object.fromEntries(STAV_NABIDKY.map((s) => [s, 0])) as Record<
    StavNabidky,
    number
  >;

  let novychTyden = 0;
  let bezReakce = 0;

  for (const radek of radky) {
    if ((STAV_NABIDKY as readonly string[]).includes(radek.stav)) {
      podleStavu[radek.stav as StavNabidky]++;
    }

    const stariDny = dnyMezi(radek.nalezeno_dne, dnes);
    if (stariDny <= 6) novychTyden++;

    const jeAktivni = radek.stav === "novy" || radek.stav === "k_zvazeni";
    if (jeAktivni && !radek.datum_reakce && stariDny >= DNI_BEZ_REAKCE_PRAH) {
      bezReakce++;
    }
  }

  return { celkem: radky.length, novychTyden, podleStavu, bezReakce };
}
