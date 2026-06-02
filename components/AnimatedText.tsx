'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { AnimationPreset } from '@/lib/versionSchema';

type AllowedTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

const MOTION_TAGS = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

const VARIANTS: Record<AnimationPreset, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'fade-up': {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  'blur-to-clear': {
    hidden: { opacity: 0, filter: 'blur(14px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
};

const REDUCED_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export interface AnimatedTextProps {
  text: string;
  preset: AnimationPreset;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: AllowedTag;
}

export function AnimatedText({
  text,
  preset,
  duration = 0.8,
  delay = 0,
  className,
  style,
  as = 'div',
}: AnimatedTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? REDUCED_VARIANTS : (VARIANTS[preset] ?? VARIANTS.fade);
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {text}
    </MotionTag>
  );
}
