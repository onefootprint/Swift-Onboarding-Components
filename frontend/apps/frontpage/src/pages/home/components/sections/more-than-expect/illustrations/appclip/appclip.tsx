import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration/base-illustration';
import styled, { css } from 'styled-components';

const AppClip = () => (
  <StyledBaseIllustration>
    <Image
      src="/home/more-than-expect/app-clip.png"
      width={165}
      height={184}
      alt="App Clip"
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 256px;

    img {
      box-shadow: ${theme.elevation[3]};
      border-radius: ${theme.borderRadius.large};
      overflow: hidden;
    }
  `}
`;

export default AppClip;
