import { Ambient } from "@/components/shell/ambient";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <Ambient />
      <div>
        <p className="eyebrow">Off course</p>
        <h1 className="display mt-5 text-5xl sm:text-6xl">This page drifted away.</h1>
        <p className="mt-5 text-ivory-muted">Let&apos;s bring you back to center.</p>
        <LinkButton href="/today" className="mt-10" size="lg">
          Return to today
        </LinkButton>
      </div>
    </main>
  );
}
