import { type VariantProps, cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

export type ButtonLinkProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'compact' | 'default' | 'large';
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'className'> &
  VariantProps<typeof buttonLink>;

const ButtonLink = ({ children, className, size, variant, ...props }: ButtonLinkProps) => {
  return (
    <a className={buttonLink({ variant, size, className })} {...props}>
      {children}
    </a>
  );
};

const buttonLink = cva(
  [
    'flex items-center justify-center select-none cursor-pointer outline-offset-4 box-border w-auto',
    'rounded border border-solid',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-purple-500 hover:bg-purple-600 active:bg-purple-600',
          'text-quinary border-transparent',
          'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.12),inset_0px_-1px_1px_rgba(200,200,200,0.2),inset_0px_1px_1px_rgba(255,255,255,0.2)]',
          'hover:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.12),inset_0px_-1px_1px_rgba(200,200,200,0.12),inset_0px_1px_1px_rgba(255,255,255,0.3)]',
          'active:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.12),inset_0px_-1px_1px_rgba(200,200,200,0.1),inset_0px_1px_1px_rgba(255,255,255,0.2)]',
        ],
        secondary: [
          'bg-gray-0 hover:bg-gray-50 active:bg-gray-50 text-primary border-primary',
          'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.12)] hover:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.12)] active:shadow-[0px_1px_1px_0px_rgba(0,0,0,0.12)]',
        ],
      },
      size: {
        compact: ['h-[28px] text-label-3 px-2'],
        default: ['h-[32px] text-label-3 px-3'],
        large: ['h-[40px] text-label-2 px-6'],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export default ButtonLink;
