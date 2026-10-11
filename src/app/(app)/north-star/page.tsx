import type { Metadata } from "next";
import { NorthStar } from "./north-star";

export const metadata: Metadata = { title: "North Star" };

export default function Page() {
  return <NorthStar />;
}
