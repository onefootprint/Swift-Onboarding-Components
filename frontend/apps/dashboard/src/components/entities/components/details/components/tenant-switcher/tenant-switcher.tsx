import { Box } from '@onefootprint/ui';
import React from 'react';
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
  const { isLoading, isSuccess } = useAssumeToViewEntity({
    entityId,
    isFirmEmployee,
  });

  return isFirmEmployee && (isLoading || isSuccess) ? <Loading /> : <Box>{children}</Box>;
};

export default TenantSwitcher;
