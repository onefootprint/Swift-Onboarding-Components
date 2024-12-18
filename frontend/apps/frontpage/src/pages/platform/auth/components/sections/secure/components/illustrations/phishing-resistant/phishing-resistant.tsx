import Image from 'next/image';
import HorizontalBeam from 'src/pages/platform/auth/components/sections/secure/components/illustrations/phishing-resistant/components/horizontal-beam';
import styled from 'styled-components';

import IllustrationContainer from '../../illustration-container';

const PhishingResistant = () => (
  <IllustrationContainer>
    <WebsiteImage side="left">
      <Image src="/auth/sections/website.png" alt="Website" width={580} height={380} />
    </WebsiteImage>
    <StyledHorizontalBeam
      width={372}
      height={180}
      speed={2}
      delay={0}
      path="M372.131 24.8554H346.256C340.333 24.8554 335.531 30.6811 335.531 37.8675V44.3735C335.531 51.5599 330.729 57.3855 324.806 57.3855H59.1C53.1767 57.3855 48.375 51.5599 48.375 44.3735V14.012C48.375 6.82569 43.5733 1 37.65 1H0.449997M0.449997 92.0843H372.131M0.449997 74.7349H372.131M0.449997 109.434H372.131M372.131 174.494H314.081C308.158 174.494 303.356 168.668 303.356 161.482V154.976C303.356 147.79 298.554 141.964 292.631 141.964H78.7625C72.8392 141.964 68.0375 147.79 68.0375 154.976V167.988C68.0375 175.174 63.2358 181 57.3125 181H0.449997M372.131 154.976H328.381C322.458 154.976 317.656 149.15 317.656 141.964V135.458C317.656 128.271 312.854 122.446 306.931 122.446H64.4625C58.5392 122.446 53.7375 128.271 53.7375 135.458V148.47C53.7375 155.656 48.9358 161.482 43.0125 161.482H0.449997"
      strokeColor="#dbdbdb"
    />
    <Icon src="/auth/sections/cloud-key.png" width={120} height={120} alt="Cloud Key" />
    <WebsiteImage side="right">
      <Image src="/auth/sections/website.png" alt="Website" width={580} height={380} />
    </WebsiteImage>
  </IllustrationContainer>
);

const StyledHorizontalBeam = styled(HorizontalBeam)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  z-index: 1;
`;

const WebsiteImage = styled.div<{ side: 'left' | 'right' }>`
  ${({ theme, side }) => `
      position: absolute;
      top: ${theme.spacing[8]};
      left: ${side === 'left' ? theme.spacing[8] : 'auto'};
      right: ${side === 'right' ? theme.spacing[8] : 'auto'};
      transform: translateX(${side === 'left' ? '-88%' : '88%'});
      box-shadow: ${theme.elevation[2]};
      overflow: hidden;
      border-radius: ${theme.borderRadius.default};
      z-index: 2;
  `};
`;

const Icon = styled(Image)`
  position: absolute;
  top: 54%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
`;

export default PhishingResistant;
