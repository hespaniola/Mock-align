import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/shell/loading";
import { Evening } from "./evening";

export const metadata: Metadata = { title: "Nightly Alignment" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Evening />
    </Suspense>
  );
}
