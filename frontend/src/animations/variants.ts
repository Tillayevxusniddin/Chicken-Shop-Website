import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.15 },
  },
};

export const staggerContainer = (stagger = 0.1): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});

export const itemFade: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.04 },
  }),
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};
