import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled, { css } from 'styled-components';

const Auth = () => (
  <StyledBaseIllustration>
    <FrontImage
      src="/home/more-than-expect/create-role-front.png"
      height={249}
      width={242}
      alt=""
    />
    <BackImage
      src="/home/more-than-expect/create-role-back.png"
      height={175}
      width={491}
      alt="Fraud Risk"
      priority
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  height: 256px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
`;

const FrontImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    box-shadow: ${theme.elevation[3]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `}
`;

const BackImage = styled(Image)`
  position: absolute;
  left: 40px;
  bottom: 0;
  transform: translateY(40%);
  z-index: 0;
`;

export default Auth;
