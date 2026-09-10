export type UlozStav = "idle" | "saving" | "saved" | "error";

export function SaveStatus({
  status,
  errorMessage,
}: {
  status: UlozStav;
  errorMessage?: string;
}) {
  if (status === "idle") return null;

  const text =
    status === "saving"
      ? "Ukládá se…"
      : status === "saved"
        ? "Uloženo"
        : (errorMessage ?? "Uložení se nepovedlo.");

  return (
    <span
      role="status"
      aria-live="polite"
      className={`text-xs ${status === "error" ? "text-horsi" : "text-gray-500"}`}
    >
      {text}
    </span>
  );
}
