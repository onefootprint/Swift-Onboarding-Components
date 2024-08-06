import { primitives } from '@onefootprint/design-tokens';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import styled, { css } from 'styled-components';

import Cloud1 from './components/cloud-1';
import Cloud2 from './components/cloud-2';
import Cloud3 from './components/cloud-3';
import Penguin from './components/penguin';

const WelcomeIllustration = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Container>
      <Aligner
        data-element="cloud-1"
        initial={{ x: 0, y: 0 }}
        animate={{ x: -400, y: [20, 0, 20] }}
        transition={{
          duration: 130,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Cloud1 fill={isDark ? primitives.Gray900 : primitives.Gray0} />
      </Aligner>
      <Aligner
        data-element="cloud-2"
        initial={{ x: 500, y: 130 }}
        animate={{ x: 100, y: 130 }}
        transition={{
          duration: 130,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Cloud2 fill={isDark ? primitives.Gray900 : primitives.Gray0} />
      </Aligner>
      <Aligner
        data-element="cloud-3"
        initial={{ x: 400, y: 0 }}
        animate={{ x: -400, y: 0 }}
        transition={{
          duration: 180,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Cloud3 fill={isDark ? primitives.Gray900 : primitives.Gray0} />
      </Aligner>
      <Aligner data-element="penguin">
        <Penguin />
      </Aligner>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 240px;
    background-color: ${theme.backgroundColor.quaternary};
    overflow: hidden;
    border-radius: ${theme.borderRadius.xl};
  `}
`;

const Aligner = styled(motion.span)`
  &[data-element='cloud-1'] {
    position: absolute;
    top: -2px;
    left: -2px;
  }

  &[data-element='cloud-2'] {
    position: absolute;
  }

  &[data-element='cloud-3'] {
    position: absolute;
  }

  &[data-element='penguin'] {
    position: absolute;
    transform: translate(-50%, 0%);
    bottom: -10px;
    left: 50%;
  }
`;

export default WelcomeIllustration;
