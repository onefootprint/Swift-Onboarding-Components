import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled, { css } from 'styled-components';

const FraudRisk = () => (
  <StyledBaseIllustration>
    <FrontImage
      src="/home/more-than-expect/fraud-risk-front.png"
      height={248}
      width={238}
      alt="Fraud Risk"
      priority
    />
    <BackImage
      src="/home/more-than-expect/fraud-risk-back.png"
      height={182}
      width={288}
      alt="Fraud Risk"
      priority
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  height: 256px;
  position: relative;
  isolation: isolate;
`;

const FrontImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    top: 40px;
    left: 55%;
    transform: translateX(-50%);
    z-index: 1;
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

const BackImage = styled(Image)`
  position: absolute;
  top: 56px;
  left: 45%;
  transform: translateX(-50%);
  z-index: 0;
`;

export default FraudRisk;
