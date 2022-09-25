import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

import DesktopPlans from './components/desktop-plans';
import MobilePlans from './components/mobile-plans';

const Plans = () => {
  const { t } = useTranslation('pages.pricing.plans');
  return (
    <>
      <PlansContainer>
        <MobilePlans />
        <DesktopPlans />
      </PlansContainer>
      <Typography
        color="secondary"
        variant="body-2"
        sx={{ textAlign: 'center' }}
      >
        {t('guarantee')}
      </Typography>
    </>
  );
};

const PlansContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[8]}px;
    `}
  `}
`;

export default Plans;
