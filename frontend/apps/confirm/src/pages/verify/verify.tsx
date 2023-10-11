import { LogoFpDefault } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import isString from 'lodash/isString';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import VerifyError from './components/verify-error';
import VerifyLoading from './components/verify-loading';
import VerifySuccess from './components/verify-success';
import useVerify from './hooks/use-verify-email';

const Verify = () => {
  const verifyMutation = useVerify();
  const router = useRouter();
  const challenge = router.asPath.split('#')[1];

  useEffect(() => {
    if (isString(challenge)) {
      verifyMutation.mutate({ data: challenge });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  return (
    <Container>
      <Inner>
        <Box marginBottom={8}>
          <LogoFpDefault />
        </Box>
        {verifyMutation.isLoading && <VerifyLoading />}
        {verifyMutation.isSuccess && <VerifySuccess />}
        {(verifyMutation.isError || !challenge) && <VerifyError />}
      </Inner>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const Inner = styled.div`
  max-width: 350px;
`;

export default Verify;
