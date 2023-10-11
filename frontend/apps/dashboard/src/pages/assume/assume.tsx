import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import useAssumeTenant from 'src/hooks/use-assume-tenant';
import useSession from 'src/hooks/use-session';

import Loading from '../auth/components/loading';

const Assume = () => {
  const router = useRouter();
  const {
    query: { tenantId },
    isReady,
  } = router;
  const { refreshUserPermissions } = useSession();

  const useAssumeTenantMutation = useAssumeTenant();

  useEffect(() => {
    if (!isReady || !tenantId || Array.isArray(tenantId)) {
      return;
    }
    useAssumeTenantMutation.mutate(
      { tenantId },
      {
        onSuccess: async () => {
          await refreshUserPermissions();
          router.replace('/');
        },
        onError: () => {
          router.push('/users');
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, tenantId]);

  return (
    <>
      <Head>
        <title>Assume Role</title>
      </Head>
      <Box aria-busy>
        <Loading />
      </Box>
    </>
  );
};

export default Assume;
