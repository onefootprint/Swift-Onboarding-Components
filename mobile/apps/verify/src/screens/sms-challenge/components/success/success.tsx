import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

const Success = () => {
  const { t } = useTranslation('pages.sms-challenge');

  return (
    <SuccessContainer>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('success')}
      </Typography>
    </SuccessContainer>
  );
};

const SuccessContainer = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    gap: ${theme.spacing[4]};
  `}
`;

export default Success;
