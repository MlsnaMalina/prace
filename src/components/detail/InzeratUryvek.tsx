export function InzeratUryvek({
  uryvek,
  url,
}: {
  uryvek: string | null;
  url: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-gray-200 px-4 py-3">
      <span className="text-xs font-medium text-gray-500">Úryvek z inzerátu</span>
      {uryvek ? (
        <blockquote className="text-sm whitespace-pre-line text-gray-700">
          {uryvek}
        </blockquote>
      ) : (
        <p className="text-sm text-gray-400">Úryvek není k dispozici.</p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-700 underline underline-offset-2 hover:text-gray-900"
      >
        Otevřít původní inzerát ↗
      </a>
    </div>
  );
}
