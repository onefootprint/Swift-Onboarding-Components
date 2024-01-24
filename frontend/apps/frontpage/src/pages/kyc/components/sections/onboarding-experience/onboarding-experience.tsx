import { IcoPencil24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import SectionCore from '../../section-text';

const bulletPointKets = ['fonts', 'variables', 'style', 'specify', 'sec'];

const OnboardingExperience = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyc.onboarding-experience',
  });
  const bulletPointContent = bulletPointKets.map(key =>
    t(`bullets.${key}` as ParseKeys<'common'>),
  );
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
