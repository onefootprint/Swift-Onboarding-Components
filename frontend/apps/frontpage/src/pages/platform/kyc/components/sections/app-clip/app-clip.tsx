import { Container, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionCore from '../../section-text';

const bulletPointKets = ['native-app', 'fast-reliable', 'brings-joy', 'conversion', 'no-download'];

const AppClip = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.kyc.app-clip' });
  const bulletPointContent = bulletPointKets.map(key => t(`bullets.${key}` as ParseKeys<'common'>));
  return (
    <Section>
      <SectionCore
        title={t('title')}
        subtitle={t('subtitle')}
        items={bulletPointContent}
        iconSrc="/kyc/icons/ico-illustrated-app-clip-40.png"
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
