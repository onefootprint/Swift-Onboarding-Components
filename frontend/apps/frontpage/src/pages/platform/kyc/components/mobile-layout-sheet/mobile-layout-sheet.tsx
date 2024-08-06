import { Container, media } from '@onefootprint/ui';
import styled from 'styled-components';

import AppClip from '../sections/app-clip';
import Confidence from '../sections/confidence/confidence';
import OnboardNewCustomers from '../sections/onboard-new-customers';
import OnboardingExperience from '../sections/onboarding-experience';
import IllustrationAppClip from './illustrations/illustration-app-clip';
import IllustrationConfidence from './illustrations/illustration-confidence';
import IllustrationOnboard from './illustrations/illustration-onboard';
import IllustrationOnboardingExperience from './illustrations/illustration-onboarding-experience';

const MobileLayoutSheet = () => (
  <SheetContainer>
    <OnboardNewCustomers />
    <IllustrationOnboard />
    <Confidence />
    <IllustrationConfidence />
    <OnboardingExperience />
    <IllustrationOnboardingExperience />
    <AppClip />
    <IllustrationAppClip />
  </SheetContainer>
);

const SheetContainer = styled(Container)`
  display: flex;
  flex-direction: column;

  ${media.greaterThan('md')`
    display: none;
  `}
`;

export default MobileLayoutSheet;
