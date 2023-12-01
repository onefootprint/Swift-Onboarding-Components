import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

const Verifying = () => {
  const { t } = useTranslation('pages.sms-challenge');

  return (
    <VerifyingContainer>
      <LoadingIndicator />
      <Typography variant="label-3">{t('verifying')}</Typography>
    </VerifyingContainer>
  );
};

const VerifyingContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Verifying;
