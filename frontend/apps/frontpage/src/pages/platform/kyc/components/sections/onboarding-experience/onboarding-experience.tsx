import { Container, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionCore from '../../section-text';

const bulletPointKets = ['fonts', 'variables', 'style', 'specify', 'sec'];

const OnboardingExperience = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyc.onboarding-experience',
  });
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}` as ParseKeys<'common'>));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        iconSrc="/kyc/icons/ico-illustrated-customization-40.svg"
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
