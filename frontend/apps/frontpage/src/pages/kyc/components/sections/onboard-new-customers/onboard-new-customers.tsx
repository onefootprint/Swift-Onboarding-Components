import { useTranslation } from '@onefootprint/hooks';
import { IcoUsers24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React from 'react';

import SectionCore from '../../section-text';

const bulletPointKets = [
  'user-experience',
  'developer-experience',
  'progressive-onboarding',
  'one-click',
];

const OnboardNewCustomers = () => {
  const { t } = useTranslation('pages.kyc.onboard-users');
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}`));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        icon={IcoUsers24}
      />
    </Section>
  );
};

const Section = styled(Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[8]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `};
`;

export default OnboardNewCustomers;
