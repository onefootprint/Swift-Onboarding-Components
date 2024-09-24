import { Box } from '@onefootprint/ui';
import type React from 'react';
import useSession from 'src/hooks/use-session';

import useAssumeToViewEntity from './hooks/use-assume-to-view-entity';

type TenantSwitcherProps = {
  children: React.ReactNode;
  entityId: string;
  Loading: () => JSX.Element;
};

const TenantSwitcher = ({ children, entityId, Loading }: TenantSwitcherProps) => {
  const {
    data: { user },
  } = useSession();
  const isFirmEmployee = !!user?.isFirmEmployee;
  const { isPending, isSuccess } = useAssumeToViewEntity({
    entityId,
    isFirmEmployee,
  });

  if (isFirmEmployee && (isPending || isSuccess)) {
    return <Loading />;
  }

  return <Box>{children}</Box>;
};

export default TenantSwitcher;
