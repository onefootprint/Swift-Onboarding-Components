import Image from 'next/image';
import React from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled, { css } from 'styled-components';

const SecurityLogs = () => (
  <StyledBaseIllustration>
    <Image
      src="/home/more-than-expect/security-logs.png"
      height={287}
      width={449}
      alt="Fraud Risk"
      priority
    />
  </StyledBaseIllustration>
);

const StyledBaseIllustration = styled(BaseIllustration)`
  ${({ theme }) => css`
    height: 256px;
    position: relative;
    isolation: isolate;
    overflow: hidden;

    img {
      position: absolute;
      top: 40px;
      left: 40px;
      box-shadow: ${theme.elevation[3]};
      border-radius: ${theme.borderRadius.default};
    }
  `}
`;

export default SecurityLogs;
