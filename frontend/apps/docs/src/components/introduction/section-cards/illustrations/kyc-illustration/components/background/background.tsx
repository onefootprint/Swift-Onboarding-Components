import times from 'lodash/times';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import VerticalBeam from '../../../components/vertical-beam';

type BackgroundProps = {
  startColor?: string;
  endColor?: string;
  isHovered?: boolean;
};

const Background = ({ startColor = '#86ffe7', endColor = '#4922d6', isHovered }: BackgroundProps) => {
  const [finalStartColor, setStartColor] = useState('#e1e1e1');
  const [finalEndColor, setEndColor] = useState('#e1e1e1');

  useEffect(() => {
    setStartColor(startColor);
    setEndColor(endColor);
  }, [startColor, endColor]);

  return (
    <Vertical>
      {times(30).map(i => (
        <VerticalBeam
          key={i}
          delay={i / 5}
          colorStart={finalStartColor}
          colorEnd={finalEndColor}
          width={2}
          height={200}
          speed={2}
          path="M1.0 1.0L1.0 200.0"
          isHovered={isHovered}
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
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default Background;
