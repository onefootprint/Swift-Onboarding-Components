import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React from 'react';

import SectionCore from '../../section-text';

const bulletPointKets = [
  'one-device',
  'proprietary-approach',
  'passkeys',
  'waterfall',
];

const Confidence = () => {
  const { t } = useTranslation('pages.kyc.confidence');
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}`));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        sectionIcon="onboard-users"
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

export default Confidence;
