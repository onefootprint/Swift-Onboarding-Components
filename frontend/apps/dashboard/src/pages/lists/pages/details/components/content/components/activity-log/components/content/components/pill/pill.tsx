import { cx } from 'class-variance-authority';
import type React from 'react';

type PillProps = {
  children: React.ReactNode;
  className?: string;
};

const Pill = ({ children, className }: PillProps) => (
  <div className={cx('flex items-center', className)}>
    <div className="flex justify-center items-center rounded-full bg-secondary px-3 py-1 h-fit">
      <span className="text-body-3">{children}</span>
    </div>
  </div>
);

export default Pill;
