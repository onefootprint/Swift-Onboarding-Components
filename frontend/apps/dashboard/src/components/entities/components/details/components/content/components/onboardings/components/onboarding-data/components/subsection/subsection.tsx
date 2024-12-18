import { Divider } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import type React from 'react';

type SubsectionProps = {
  title: string;
  hasDivider?: boolean;
  rightComponent?: React.ReactNode;
  children: React.ReactNode;
};

const Subsection = ({ title, hasDivider, rightComponent, children }: SubsectionProps) => (
  <div
    className={cx('flex flex-col', {
      'gap-2': hasDivider,
      'gap-4': !hasDivider,
    })}
  >
    <div className="flex justify-between items-center">
      <span className="text-heading-5">{title}</span>
      {rightComponent}
    </div>
    {hasDivider && <Divider variant="secondary" className="mb-1" />}
    {children}
  </div>
);

export default Subsection;
