import { useTranslation } from '@onefootprint/hooks';
import { IcoStore24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React from 'react';

import TimelineLayout from '../../components/timeline-layout';
import TimelineTitle from '../../components/timeline-title';
import DesktopIllustration from './components/desktop-illustration';
import MobileIllustration from './components/mobile-illustration';

const IdentifyBusinesses = () => {
  const { t } = useTranslation('pages.kyb.identify-businesses');
  return (
    <Content>
      <TimelineLayout icon={IcoStore24}>
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
