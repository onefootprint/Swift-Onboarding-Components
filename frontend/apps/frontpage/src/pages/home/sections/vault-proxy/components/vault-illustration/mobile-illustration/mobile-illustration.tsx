import { IcoFootprint40 } from '@onefootprint/icons';
import { Box, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const MobileIllustration = () => (
  <>
    <Box sx={{ marginTop: 4 }} />
    <Container>
      <Input>
        <Image
          src="/home/vault-proxy/tokens/value.svg"
          height={240}
          width={240}
          alt="decorative"
        />
      </Input>
      <Knob>
        <StyledFootprintIcon color="septenary" />
        <OuterBorder
          src="/home/vault-proxy/tokens/knob-outer.svg"
          height={156}
          width={156}
          alt="decorative"
        />
        <Lines
          src="/home/vault-proxy/tokens/knob-lines.svg"
          height={124}
          width={124}
          alt="decorative"
          animate={{
            rotate: [0, 32, 24, -48, -32, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'mirror',
          }}
        />
        <Top
          src="/home/vault-proxy/tokens/knob-top.svg"
          height={108}
          width={108}
          alt="decorative"
        />
      </Knob>
      <Input>
        <Image
          src="/home/vault-proxy/tokens/token.svg"
          height={240}
          width={240}
          alt="decorative"
        />
      </Input>
    </Container>
  </>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    align-items: center;
    padding-bottom: ${theme.spacing[12]};
    flex-direction: column;

    ${media.greaterThan('md')`
        display: none;
    `}
  `}
`;

const Knob = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  isolation: isolate;
  height: 200px;

  img {
    position: absolute;
  }
`;

const OuterBorder = styled(Image)`
  z-index: 1;
`;

const Lines = styled(motion.img)`
  z-index: 2;
`;

const Top = styled(Image)`
  z-index: 3;
`;

const StyledFootprintIcon = styled(IcoFootprint40)`
  z-index: 4;
`;

const Input = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;

  img {
    width: 85%;
    height: 100%;
  }
`;

export default MobileIllustration;
