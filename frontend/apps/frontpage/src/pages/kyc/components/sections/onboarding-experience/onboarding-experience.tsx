import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React from 'react';

import SectionCore from '../../section-text';

const bulletPointKets = ['fonts', 'variables', 'style', 'specify', 'sec'];

const OnboardingExperience = () => {
  const { t } = useTranslation('pages.kyc.onboarding-experience');
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}`));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        icon={IcoPencil24}
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

export default OnboardingExperience;
