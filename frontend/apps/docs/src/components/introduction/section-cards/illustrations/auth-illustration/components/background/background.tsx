import { primitives } from '@onefootprint/design-tokens';
import { useTheme } from 'next-themes';
import styled from 'styled-components';

import HorizontalBeam from '../../../components/horizontal-beam';

type BackgroundProps = {
  isHovered?: boolean;
};

const Background = ({ isHovered = false }: BackgroundProps) => {
  const theme = useTheme();
  const isDark = theme.theme === 'dark';

  return (
    <Beams>
      <HorizontalBeam
        width={352}
        height={169}
        speed={3}
        delay={0}
        className="beam-1"
        strokeColor={isDark ? primitives.Gray700 : primitives.Gray100}
        colorStart={isDark ? primitives.Purple100 : primitives.Purple600}
        colorEnd={isDark ? primitives.Purple700 : primitives.Purple100}
        path="M69.4664 0H68.5329C39.933 18.2247 16.2702 43.5098 0 73.4002V74.4507C16.3665 44.0489 40.3803 18.3737 69.4664 0ZM0.75 169C0.75 88.3301 55.2556 20.3907 129.448 0H131.373C56.4793 19.7239 1.25 87.9122 1.25 169H0.75ZM351 159.558C346.939 83.068 293.831 19.59 222.552 0H220.627C295.521 19.7239 350.75 87.9122 350.75 169H351V159.558ZM351 72.6162C334.662 43.0157 311.033 18.003 282.534 0H283.467C311.486 17.8547 334.767 42.4861 351 71.5855V72.6162ZM326.25 169C326.25 86.0192 258.981 18.75 176 18.75C93.0192 18.75 25.75 86.0192 25.75 169H26.25C26.25 86.2954 93.2954 19.25 176 19.25C258.705 19.25 325.75 86.2954 325.75 169H326.25ZM301.25 169C301.25 99.8263 245.174 43.75 176 43.75C106.826 43.75 50.75 99.8263 50.75 169H51.25C51.25 100.102 107.102 44.25 176 44.25C244.898 44.25 300.75 100.102 300.75 169H301.25ZM276.25 169C276.25 113.633 231.367 68.75 176 68.75C120.633 68.75 75.75 113.633 75.75 169H76.25C76.25 113.91 120.91 69.25 176 69.25C231.09 69.25 275.75 113.91 275.75 169H276.25Z"
        isHovered={isHovered}
      />
    </Beams>
  );
};

const Beams = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform: rotate(180);
`;

export default Background;
