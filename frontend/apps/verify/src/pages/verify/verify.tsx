import { useTranslation } from 'hooks';
import isString from 'lodash/isString';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Box } from 'ui';

import VerifyError from './components/verify-error';
import VerifyLoading from './components/verify-loading';
import VerifySuccess from './components/verify-success';
import useVerify from './hooks/use-verify-email';

const Verify = () => {
  const { t } = useTranslation('pages.verify');
  const verifyMutation = useVerify();
  const router = useRouter();
  const challenge = router.asPath.split('#')[1];

  useEffect(() => {
    if (isString(challenge)) {
      verifyMutation.mutate({ data: challenge });
    }
  }, [challenge]);

  return (
    <Container>
      <Inner>
        <Box sx={{ marginBottom: 8 }}>
          <Image
            alt={t('logo-alt')}
            height={26}
            layout="fixed"
            src="/logo.png"
            width={122}
          />
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
