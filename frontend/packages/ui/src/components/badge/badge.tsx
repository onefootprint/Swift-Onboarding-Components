import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>;

const Badge = ({ children, className, variant, ...props }: BadgeProps) => {
  return (
    <span className={badge({ variant, className })} {...props}>
      {children}
    </span>
  );
};

const badge = cva(['inline-flex items-center justify-center', 'text-caption-1', 'rounded-lg', 'px-2 py-1'], {
  variants: {
    variant: {
      accent: ['text-accent', 'bg-accent'],
      error: ['text-error', 'bg-error'],
      info: ['text-info', 'bg-info'],
      neutral: ['text-neutral', 'bg-neutral'],
      success: ['text-success', 'bg-success'],
      warning: ['text-warning', 'bg-warning'],
      successInverted: ['text-successInverted', 'bg-successInverted'],
      warningInverted: ['text-warningInverted', 'bg-warningInverted'],
      errorInverted: ['text-errorInverted', 'bg-errorInverted'],
      infoInverted: ['text-infoInverted', 'bg-infoInverted'],
      neutralInverted: ['text-neutralInverted', 'bg-neutralInverted'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export default Badge;
