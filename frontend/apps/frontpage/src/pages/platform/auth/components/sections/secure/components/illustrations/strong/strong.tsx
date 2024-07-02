import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import IllustrationContainer from '../../illustration-container/illustration-container';

const Strong = () => (
  <IllustrationContainer>
    <ImageContainer>
      <Image src="/auth/sections/strong.png" alt="Strong" width={767} height={500} />
    </ImageContainer>
  </IllustrationContainer>
);

const ImageContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[8]};
    left: ${theme.spacing[8]};
    box-shadow: ${theme.elevation[2]};
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
  `};
`;

export default Strong;
