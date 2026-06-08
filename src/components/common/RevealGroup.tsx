"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  threshold?: number;
};

export function RevealGroup({
  children,
  className,
  threshold = 0.14,
}: RevealGroupProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      viewport={{ once: true, amount: threshold }}
      whileInView="visible"
    >
      {children}
    </motion.div>
  );
}

export const revealGroupItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
