import Link from "next/link";
import { buildHref } from "@/lib/filters";
import type { RawSearchParams } from "@/lib/filters";

export function FilterChipLink({
  searchParams,
  paramKey,
  value,
  currentValues,
  label,
}: {
  searchParams: RawSearchParams;
  paramKey: string;
  value: string;
  currentValues: string[];
  label: string;
}) {
  const aktivni = currentValues.includes(value);
  const noveHodnoty = aktivni
    ? currentValues.filter((v) => v !== value)
    : [...currentValues, value];
  const href = buildHref(searchParams, {
    [paramKey]: noveHodnoty.length > 0 ? noveHodnoty.join(",") : null,
  });

  return (
    <Link
      href={href}
      aria-pressed={aktivni}
      className={`rounded border px-2 py-1 text-xs ${
        aktivni
          ? "border-gray-700 bg-gray-800 text-white"
          : "border-gray-300 text-gray-700 hover:border-gray-400"
      }`}
    >
      {label}
    </Link>
  );
}
