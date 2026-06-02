export function ErrorUI({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
      <div className="max-w-lg text-center space-y-4">
        <p className="text-neutral-500 text-xs tracking-[0.25em] uppercase">
          Configuration Error
        </p>
        <h1 className="text-white text-2xl font-light tracking-wide">
          Unable to load invitation
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed">{error}</p>
        <p className="text-neutral-600 text-xs mt-6 leading-relaxed">
          Check{' '}
          <code className="text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded text-xs">
            data/versions/*.json
          </code>{' '}
          and ensure{' '}
          <code className="text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded text-xs">
            NEXT_PUBLIC_INVITE_VERSION
          </code>{' '}
          is set to a valid value (
          <code className="text-neutral-500 text-xs">classic</code>,{' '}
          <code className="text-neutral-500 text-xs">minimal</code>, or{' '}
          <code className="text-neutral-500 text-xs">warm</code>).
        </p>
      </div>
    </div>
  );
}
