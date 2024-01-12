import styled, { css } from '@onefootprint/styled';
import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration/base-illustration';

const AppClip = () => (
  <StyledBaseIllustration>
    <Image
      src="/home/more-than-expect/app-clip.png"
      width={166 * 1.1}
      height={185 * 1.1}
      alt="App Clip"
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  ${({ theme }) => css`
    position: relative;
    height: 256px;

    img {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      box-shadow: ${theme.elevation[3]};
      border-radius: ${theme.borderRadius.large};
      overflow: hidden;
    }
  `}
`;

export default AppClip;
