import { media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import TimelineLayout from '../../components/timeline-layout';
import TimelineTitle from '../../components/timeline-title';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';

const SecurelyStore = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyb.securely-store',
  });
  return (
    <TimelineLayout iconSrc="/kyb/icons/ico-illustrated-confidence-40.svg">
      <Content>
        <TimelineTitle title={t('title')} subtitle={t('subtitle')} />
        <DesktopIllustration />
        <MobileIllustration />
      </Content>
    </TimelineLayout>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    ${media.greaterThan('md')`
      gap: ${theme.spacing[10]};
    `}
  `}
`;

export default SecurelyStore;
