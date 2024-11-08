import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type { HTMLAttributes } from 'react';

export type TagProps = {
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const Tag = ({ children, className, ...props }: TagProps) => {
  return (
    <span
      className={cx(
        className,
        'flex items-center h-6',
        'text-caption-1 text-neutral whitespace-nowrap',
        'px-2 py-1',
        'border border-solid border-primary',
        'rounded-full',
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Tag;
