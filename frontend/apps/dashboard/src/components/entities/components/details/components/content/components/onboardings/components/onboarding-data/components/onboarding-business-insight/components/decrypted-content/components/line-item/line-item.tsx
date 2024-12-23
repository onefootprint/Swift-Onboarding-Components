import { Divider } from '@onefootprint/ui';
import type React from 'react';

type LineItemProps = {
  label: string;
  value?: string;
  badge?: React.ReactNode;
  customValue?: React.ReactNode;
};

const LineItem = ({ label, value, badge, customValue }: LineItemProps) => (
  <div className="flex items-end gap-2 w-full">
    <div className="flex items-center gap-2 min-w-fit max-w-[50%]">
      <p className="text-body-3">{label}</p>
      {badge}
    </div>
    <Divider variant="secondary" marginBottom={2} />
    {customValue ?? <p className="text-body-3 min-w-fit max-w-1/2 overflow-scroll">{value}</p>}
  </div>
);

export default LineItem;
