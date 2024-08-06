import { motion } from 'framer-motion';
import Image from 'next/image';
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
      <Grid variants={containerVariants} initial="hidden" animate="show">
        <Waves>
          <Image alt="" src="/kyc/hero/waves.svg" height={400} width={1400} priority />
        </Waves>
        <Col variants={columnVariants}>
          <Image alt="" src="/kyc/hero/hey-there.png" height={234} width={283} priority />
          <Image alt="" src="/kyc/hero/basic-data.png" height={257} width={283} priority />
        </Col>
        <Col variants={columnVariants}>
          <Image alt="" src="/kyc/hero/address.png" height={413} width={283} priority />
        </Col>
        <Col variants={columnVariants}>
          <Image alt="" src="/kyc/hero/ssn.png" height={383} width={283} priority />
        </Col>
      </Grid>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
`;

const Grid = styled(motion.div)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(3, 283px);
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[4]};
    mask: linear-gradient(180deg, #fff 85%, transparent 92%);
    height: 340px;
    mask-mode: alpha;
    margin: 0 auto;
    z-index: 1;
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

    img {
      z-index: 1;
      background-color: ${theme.backgroundColor.primary};
    }
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
