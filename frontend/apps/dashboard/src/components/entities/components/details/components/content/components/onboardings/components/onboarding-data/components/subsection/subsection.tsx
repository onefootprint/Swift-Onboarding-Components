import { Divider } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import type React from 'react';

type SubsectionProps = {
  title: string;
  hasDivider?: boolean;
  rightComponent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const Subsection = ({ title, hasDivider, rightComponent, children, className }: SubsectionProps) => (
  <div className={cx('flex flex-col min-h-full gap-2', className)}>
    <div className="flex items-center justify-between">
      <span className="text-label-2">{title}</span>
      {rightComponent}
    </div>
    {hasDivider && <Divider variant="secondary" className="mb-1" />}
    {children}
  </div>
);

export default Subsection;
