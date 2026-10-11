/** Calm placeholder shown for the instant before local data is read. */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-[60dvh] place-items-center">
      <span className="relative grid size-10 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full border border-accent/30 [animation-duration:2s]" />
        <span className="size-2 rounded-full bg-accent" />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
