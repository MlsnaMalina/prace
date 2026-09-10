import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-3 px-4 py-6">
      <p className="text-sm text-gray-600">Tahle nabídka neexistuje nebo byla smazána.</p>
      <Link href="/" className="text-sm text-gray-700 underline underline-offset-2">
        ← Zpět na seznam
      </Link>
    </main>
  );
}
