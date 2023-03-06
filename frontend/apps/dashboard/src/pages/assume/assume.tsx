import { Box } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import Loading from '../auth/components/loading';
import useAssumeTenant from './hooks/use-assume-tenant';

const Assume = () => {
  const router = useRouter();
  const {
    query: { tenantId },
    isReady,
  } = router;

  const useAssumeTenantMutation = useAssumeTenant();

  useEffect(() => {
    if (!isReady || !tenantId || Array.isArray(tenantId)) {
      return;
    }
    useAssumeTenantMutation.mutate(
      { tenantId },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: () => {
          router.push('/users');
        },
      },
    );
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
