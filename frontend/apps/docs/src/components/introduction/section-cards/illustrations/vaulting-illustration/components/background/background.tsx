import styled from '@onefootprint/styled';
import times from 'lodash/times';
import React, { useEffect, useState } from 'react';

import VerticalBeam from '../../../components/vertical-beam';

type BackgroundProps = {
  startColor?: string;
  endColor?: string;
  isHovered?: boolean;
};

const Background = ({
  startColor = '#77d4ff',
  endColor = '#89e568',
  isHovered,
}: BackgroundProps) => {
  const [finalStartColor, setStartColor] = useState('#e1e1e1');
  const [finalEndColor, setEndColor] = useState('#e1e1e1');

  useEffect(() => {
    setStartColor(startColor);
    setEndColor(endColor);
  }, [startColor, endColor]);

  return (
    <Vertical>
      {times(20).map(i => (
        <VerticalBeam
          key={i}
          delay={i / 5}
          colorStart={finalStartColor}
          colorEnd={finalEndColor}
          width={2}
          height={300}
          speed={4}
          path="M1.0 1.0L1.0 200.0"
          isHovered={isHovered}
          className="rotate"
        />
      ))}
    </Vertical>
  );
};

const Vertical = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: -20%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .rotate {
    transform: rotate(45deg) scale(1.5);
  }
`;

export default Background;
