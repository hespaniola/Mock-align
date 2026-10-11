"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Something slipped</p>
        <h1 className="display mt-5 text-4xl sm:text-5xl">A moment of misalignment.</h1>
        <p className="mx-auto mt-5 max-w-md text-ivory-muted">
          Your entries are saved on this device. Try again, or head back to today.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/today" variant="secondary">
            Today
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
