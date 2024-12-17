import { Divider } from '@onefootprint/ui';
import type React from 'react';

type SubsectionProps = {
  title: string;
  rightComponent?: React.ReactNode;
  children: React.ReactNode;
};

const Subsection = ({ title, rightComponent, children }: SubsectionProps) => (
  <>
    <div className="flex justify-between items-center">
      <span className="text-heading-5">{title}</span>
      {rightComponent}
    </div>
    <Divider variant="secondary" />
    {children}
  </>
);

export default Subsection;
