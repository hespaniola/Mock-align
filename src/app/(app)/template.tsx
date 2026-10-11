"use client";

import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

/** Route entrance — re-mounts on every navigation within the app shell. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      {children}
    </motion.div>
  );
}
