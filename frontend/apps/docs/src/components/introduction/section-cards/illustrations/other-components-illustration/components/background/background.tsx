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
        height={120}
        speed={2}
        delay={0}
        className="beam-1"
        strokeColor={isDark ? primitives.Gray700 : primitives.Gray200}
        colorStart={isDark ? primitives.Yellow400 : primitives.Yellow800}
        colorEnd={isDark ? primitives.Yellow600 : primitives.Yellow300}
        path="M0.149658 121H163.576C169.099 121 173.576 116.523 173.576 111V57.8C173.576 52.2772 178.053 47.8 183.576 47.8H290.676C296.199 47.8 300.676 43.3229 300.676 37.8V11C300.676 5.47715 305.153 1 310.676 1H355"
        isHovered={isHovered}
      />
      <HorizontalBeam
        width={352}
        height={120}
        speed={3}
        delay={0}
        className="beam-2"
        strokeColor={isDark ? primitives.Gray700 : primitives.Gray200}
        colorStart={isDark ? primitives.Yellow400 : primitives.Yellow800}
        colorEnd={isDark ? primitives.Yellow600 : primitives.Yellow300}
        path="M0.149658 121H163.576C169.099 121 173.576 116.523 173.576 111V57.8C173.576 52.2772 178.053 47.8 183.576 47.8H290.676C296.199 47.8 300.676 43.3229 300.676 37.8V11C300.676 5.47715 305.153 1 310.676 1H355"
        isHovered={isHovered}
      />
      <HorizontalBeam
        width={352}
        height={120}
        speed={4}
        delay={0}
        className="beam-3"
        strokeColor={isDark ? primitives.Gray700 : primitives.Gray200}
        colorStart={isDark ? primitives.Yellow400 : primitives.Yellow800}
        colorEnd={isDark ? primitives.Yellow600 : primitives.Yellow300}
        path="M0.149658 121H163.576C169.099 121 173.576 116.523 173.576 111V57.8C173.576 52.2772 178.053 47.8 183.576 47.8H290.676C296.199 47.8 300.676 43.3229 300.676 37.8V11C300.676 5.47715 305.153 1 310.676 1H355"
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

  .beam-1 {
    position: absolute;
    left: 0px;
    top: 10px;
    transform: rotate(180deg);
  }

  .beam-2 {
    position: absolute;
    left: 0px;
    top: 40px;
    transform: rotate(90deg);
  }

  .beam-3 {
    position: absolute;
    left: 0px;
    top: 40px;
    transform: rotate(180deg);
  }
`;

export default Background;
