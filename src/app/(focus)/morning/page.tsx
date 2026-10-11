import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/shell/loading";
import { Morning } from "./morning";

export const metadata: Metadata = { title: "Morning Alignment" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <Morning />
    </Suspense>
  );
}
