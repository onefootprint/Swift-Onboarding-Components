import { Container } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const Illustration = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const columnVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <IllustrationContainer>
      <Container
        sx={{
          zIndex: 1,
        }}
      >
        <Grid variants={containerVariants} initial="hidden" animate="show">
          <Col variants={columnVariants}>
            <Image
              alt=""
              src="/kyc/hero/hey-there.png"
              height={234}
              width={283}
              priority
            />
            <Image
              alt=""
              src="/kyc/hero/basic-data.png"
              height={257}
              width={283}
              priority
            />
          </Col>
          <Col variants={columnVariants}>
            <Image
              alt=""
              src="/kyc/hero/address.png"
              height={413}
              width={283}
              priority
            />
          </Col>
          <Col variants={columnVariants}>
            <Image
              alt=""
              src="/kyc/hero/ssn.png"
              height={383}
              width={283}
              priority
            />
          </Col>
        </Grid>
      </Container>
      <Waves>
        <Image
          alt=""
          src="/kyc/hero/waves.svg"
          height={400}
          width={1400}
          priority
        />
      </Waves>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Grid = styled(motion.div)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(3, 283px);
    justify-content: center;
    gap: ${theme.spacing[4]};
    mask: linear-gradient(180deg, #fff 85%, transparent 92%);
    height: 340px;
    mask-mode: alpha;
  `}
`;

const Col = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    height: fit-content;
  `}
`;

const Waves = styled.div`
  position: absolute;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  z-index: 0;
  max-width: 100%;
`;

export default Illustration;
