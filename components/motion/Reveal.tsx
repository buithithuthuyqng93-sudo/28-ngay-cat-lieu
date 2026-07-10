"use client";

import { motion } from "motion/react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  /** "view" animates when scrolled into view (default). "mount" animates immediately, for above-the-fold content. */
  mode?: "view" | "mount";
  /** HTML tag to render — use "li" when inside a <ul>/<ol>. */
  as?: "div" | "li";
};

export function Reveal({ children, delay = 0, y = 24, x = 0, className, mode = "view", as = "div" }: RevealProps) {
  const transition = { duration: 0.6, delay, ease: EASE };
  const MotionTag = as === "li" ? motion.li : motion.div;

  if (mode === "mount") {
    return (
      <MotionTag
        initial={{ opacity: 0, y, x }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={transition}
        className={className}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={transition}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
