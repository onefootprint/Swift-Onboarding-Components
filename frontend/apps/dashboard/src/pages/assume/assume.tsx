import { Box, Button, Container } from '@onefootprint/ui';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import useAssumeTenant from './hooks/use-assume-tenant';

const Assume = () => {
  const router = useRouter();
  const {
    query: { tenantId },
  } = router;

  const useAssumeTenantHook = useAssumeTenant();

  const handleClick = () => {
    if (!tenantId || Array.isArray(tenantId)) {
      return;
    }
    useAssumeTenantHook.mutate(
      { tenantId },
      {
        onSuccess: () => {
          router.replace('/');
        },
      },
    );
  };

  return (
    <>
      <Head>
        <title>Assume Role</title>
      </Head>
      <Container>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
          }}
        >
          <Button onClick={handleClick}>{`Assume  "${tenantId}"`}</Button>
        </Box>
      </Container>
    </>
  );
};

export default Assume;
