import type { Icon } from '@onefootprint/icons';
import { Divider } from '@onefootprint/ui';
import type React from 'react';

type BorderedSectionProps = {
  title?: string;
  children: React.ReactNode;
  variant: 'default' | 'withDivider';
  icon?: Icon;
};

const Section = ({ title, variant, children, icon: Icon }: BorderedSectionProps) => {
  return (
    <div className="flex flex-col gap-3 mb-2">
      {title && (
        <div className="flex flex-row items-center gap-3">
          {Icon && <Icon />}
          <h3 className="text-label-2">{title}</h3>
        </div>
      )}
      {variant === 'withDivider' && <Divider variant="secondary" />}
      <div className="flex flex-col gap-7">{children}</div>
    </div>
  );
};

export default Section;
