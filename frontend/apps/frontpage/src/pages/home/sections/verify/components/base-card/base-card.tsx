import { cx } from 'class-variance-authority';
import type { CSSProperties, ForwardedRef, ReactNode } from 'react';
import { forwardRef } from 'react';

type BaseCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  ({ children, className }, ref: ForwardedRef<HTMLDivElement>) => {
    const baseClasses = cx(
      'relative flex flex-col border border-solid rounded border-tertiary bg-primary h-[420px] isolate z-0 md:max-w-full max-w-[95%] w-full mx-auto',
      className,
    );

    return (
      <div className={baseClasses} ref={ref}>
        {children}
      </div>
    );
  },
);

export default BaseCard;
