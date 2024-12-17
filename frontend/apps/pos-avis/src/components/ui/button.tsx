import { type VariantProps, cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

const Button = ({ children, className, variant, ...props }: ButtonProps) => {
  return (
    <button className={button({ variant, className })} {...props}>
      {children}
    </button>
  );
};

const button = cva(
  'w-full h-10 flex items-center justify-center cursor-pointer text-label-3 text-center disabled:cursor-not-allowed disabled:opacity-20',
  {
    variants: {
      variant: {
        primary: 'text-quinary bg-accent',
        secondary: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export default Button;
