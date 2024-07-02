import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import TimelineLayout from '../../components/timeline-layout';
import TimelineTitle from '../../components/timeline-title';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';

const IdentifyBusinesses = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.kyb.identify-businesses',
  });
  return (
    <Content>
      <TimelineLayout iconSrc="/kyb/icons/ico-illustrated-store-40.svg">
        <TimelineTitle title={t('title')} subtitle={t('subtitle')} />
        <DesktopIllustration />
        <MobileIllustration />
      </TimelineLayout>
    </Content>
  );
};

const Content = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[10]};
    margin-bottom: ${theme.spacing[10]};
    width: 100%;
    overflow: hidden;
  `}
`;
export default IdentifyBusinesses;
