import { IcoUsers24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { useTranslation } from 'react-i18next';

import TimelineLayout from '../../components/timeline-layout';
import TimelineTitle from '../../components/timeline-title';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';

const IdentifyBos = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyb.identify-bos',
  });
  return (
    <TimelineLayout icon={IcoUsers24}>
      <Content>
        <TimelineTitle
          title={t('title')}
          subtitle={t('subtitle')}
          cta={t('cta')}
          href="/kyc"
        />
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
    gap: ${theme.spacing[10]};
    margin-bottom: ${theme.spacing[10]};
  `}
`;
export default IdentifyBos;
