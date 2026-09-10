export function ResultCount({
  zobrazeno,
  celkem,
}: {
  zobrazeno: number;
  celkem: number;
}) {
  return (
    <p className="text-sm text-gray-600">
      Zobrazeno {zobrazeno} z {celkem} {celkem === 1 ? "nabídky" : "nabídek"}
    </p>
  );
}
