import { type VariantProps, cva } from 'class-variance-authority';
import type React from 'react';

export type BannerVariant = 'error' | 'warning' | 'info' | 'announcement';

export type BannerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof banner> & {
    children: React.ReactNode;
    variant: BannerVariant;
  };

const Banner = ({ children, variant, className, ...props }: BannerProps) => {
  return (
    <div role="alert" className={banner({ variant, className })} {...props}>
      {children}
    </div>
  );
};
const banner = cva(
  [
    'w-full text-center px-4 py-3 text-label-3',
    '[&_a:hover]:opacity-70 [&_button:hover]:opacity-70',
    '[&_a:active]:opacity-85 [&_button:active]:opacity-85',
    '[&_a]:underline [&_button]:underline',
    '[&_a]:ml-1 [&_button]:ml-1',
  ],
  {
    variants: {
      variant: {
        error: ['bg-error text-error', '[&>a]:text-error [&>button]:text-error'],
        info: ['bg-info text-info', '[&>a]:text-info [&>button]:text-info'],
        warning: ['bg-warning text-warning', '[&>a]:text-warning [&>button]:text-warning'],
        announcement: ['bg-primary text-primary', '[&>a]:text-accent [&>button]:text-accent'],
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

export default Banner;
