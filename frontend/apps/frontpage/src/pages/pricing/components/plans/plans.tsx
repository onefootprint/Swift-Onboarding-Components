import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import DesktopPlans from './components/desktop-plans';
import MobilePlans from './components/mobile-plans';

const Plans = () => (
  <PlansContainer>
    <MobilePlans />
    <DesktopPlans />
  </PlansContainer>
);

const PlansContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      margin-bottom: ${theme.spacing[8]};
    `}
  `}
`;

export default Plans;
