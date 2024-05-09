import { media } from '@onefootprint/ui';
import times from 'lodash/times';
import React, { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import HorizontalBeam from 'src/components/horizontal-beam/horizontal-beam';
import styled from 'styled-components';

import VerticalBeam from '../../../../../../../components/vertical-beam';

type BackgroundProps = {
  className?: string;
};

const Background = ({ className = 'beam' }: BackgroundProps) => {
  const [startColor, setStartColor] = useState('#e1e1e1');
  const [endColor, setEndColor] = useState('#e1e1e1');

  useEffect(() => {
    setStartColor('#ff86fd');
    setEndColor('#ff008c');
  }, [startColor, endColor]);

  return (
    <>
      <Vertical>
        {times(isMobile ? 10 : 20).map(i => (
          <VerticalBeam
            key={i}
            delay={i}
            colorStart={startColor}
            colorEnd={endColor}
            width={2}
            height={2000}
            speed={12}
            path="M1.0 1.0L1.0 2000.0"
            strokeColor="#c5c5c5"
            className="beam"
          />
        ))}
        {times(isMobile ? 10 : 20).map(i => (
          <VerticalBeam
            key={i}
            delay={i}
            colorStart={startColor}
            colorEnd={endColor}
            width={2}
            height={2000}
            speed={12}
            path="M1.0 1.0L1.0 2000.0"
            strokeColor="#c5c5c5"
            className="beam"
          />
        ))}
      </Vertical>
      <Horizontal className={className}>
        {times(20).map(i => (
          <HorizontalBeam
            key={i}
            delay={i}
            colorStart={startColor}
            colorEnd={endColor}
            width={2500}
            height={20}
            speed={12}
            path="M1 2H2500"
            strokeColor="#c5c5c5"
            className="beam"
          />
        ))}
      </Horizontal>
    </>
  );
};

const Vertical = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  mask-mode: alpha;
  mask: radial-gradient(
    50% 60% at 50% 50%,
    white 0%,
    white 90%,
    transparent 100%
  );

  ${media.greaterThan('md')`
    mask: radial-gradient(
      50% 90% at 50% 50%,
      white 0%,
      white 90%,
      transparent 100%
    );
  `}

  ${media.greaterThan('xl')`
    padding: 0 200px;
    mask: radial-gradient(
      50% 60% at 50% 50%,
      white 0%,
      white 70%,
      transparent 90%
    );
  `}
`;

const Horizontal = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  mask-mode: alpha;
  mask: radial-gradient(
    50% 50% at 50% 50%,
    white 0%,
    white 90%,
    transparent 100%
  );

  ${media.greaterThan('md')`
    mask: radial-gradient(
      80% 50% at 50% 50%,
      white 0%,
      transparent 100%
    );
  `}

  ${media.greaterThan('xl')`
    mask: radial-gradient(
      50% 50% at 50% 50%,
      white 0%,
      white 50%,
      transparent 100%
    );

  `}
`;

export default Background;
