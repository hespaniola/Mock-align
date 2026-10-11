import type { Metadata } from "next";
import { Journey } from "./journey";

export const metadata: Metadata = { title: "Journey" };

export default function Page() {
  return <Journey />;
}
