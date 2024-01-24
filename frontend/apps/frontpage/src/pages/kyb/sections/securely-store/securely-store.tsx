import { IcoDatabase24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TimelineLayout from '../../components/timeline-layout';
import TimelineTitle from '../../components/timeline-title';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';

const SecurelyStore = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyb.securely-store',
  });
  return (
    <TimelineLayout icon={IcoDatabase24}>
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
