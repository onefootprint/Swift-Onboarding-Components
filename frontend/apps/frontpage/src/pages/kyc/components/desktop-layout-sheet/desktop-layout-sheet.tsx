import styled from '@onefootprint/styled';
import { Box, Container, media } from '@onefootprint/ui';
import React from 'react';

import AppClip from '../sections/app-clip';
import Confidence from '../sections/confidence';
import OnboardNewCustomers from '../sections/onboard-new-customers';
import OnboardingExperience from '../sections/onboarding-experience';
import StickyRail from './sticky-rail';

const DesktopLayoutSheet = () => (
  <SplitContainer>
    <ScrollingContent>
      <OnboardNewCustomers />
      <Box sx={{ marginBottom: 15 }} />
      <Confidence />
      <Box sx={{ marginBottom: 15 }} />
      <OnboardingExperience />
      <Box sx={{ marginBottom: 15 }} />
      <AppClip />
      <Box sx={{ marginBottom: 15 }} />
    </ScrollingContent>
    <StickyRail />
  </SplitContainer>
);

const SplitContainer = styled(Container)`
  display: none;
  position: relative;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 'scroll stickyRail';
  margin-top: 200px;

  ${media.greaterThan('md')`
    display: grid;
  `}
`;

const ScrollingContent = styled.div`
  grid-area: scroll;
  width: 100%;
`;

export default DesktopLayoutSheet;
