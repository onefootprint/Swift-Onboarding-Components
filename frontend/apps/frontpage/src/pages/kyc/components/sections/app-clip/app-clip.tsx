import { useTranslation } from '@onefootprint/hooks';
import { IcoSquareFrame24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React from 'react';

import SectionCore from '../../section-text';

const bulletPointKets = [
  'native-app',
  'fast-reliable',
  'brings-joy',
  'conversion',
  'no-download',
];

const AppClip = () => {
  const { t } = useTranslation('pages.kyc.app-clip');
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}`));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        icon={IcoSquareFrame24}
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

export default AppClip;
