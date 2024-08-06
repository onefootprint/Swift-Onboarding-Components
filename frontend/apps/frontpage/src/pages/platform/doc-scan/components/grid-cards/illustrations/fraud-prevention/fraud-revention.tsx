import styled, { css, useTheme } from 'styled-components';

const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 90;
const SHORT_LINE = 8;
const LONG_LINE = 16;

const WIDTH = 1;

const FraudPrevention = () => {
  const theme = useTheme();
  const rects = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i * 10 * Math.PI) / 180;
    const isHeavyMark = i % 3 === 0;
    const x = CX + R * Math.cos(angle) - (isHeavyMark ? LONG_LINE : SHORT_LINE) / 2;
    const y = CY + R * Math.sin(angle) - WIDTH / 2;
    rects.push(
      <rect
        key={i}
        x={x}
        y={y}
        width={isHeavyMark ? LONG_LINE : SHORT_LINE}
        height={WIDTH}
        fill={isHeavyMark ? 'black' : 'lightgray'}
        transform={`rotate(${i * 10}, ${x + (isHeavyMark ? LONG_LINE : SHORT_LINE) / 2}, ${y + WIDTH / 2})`}
      />,
    );
  }

  return (
    <Container>
      <Clock>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {rects}
          <circle cx={CX} cy={CY} r={R - 4} fill="white" />
          <circle cx={CX} cy={CY} r={R - 40} fill="url(#grad1)" stroke={theme.borderColor.tertiary} strokeWidth="1" />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f7f7f7', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgba(244, 244, 244, 0.00)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
      </Clock>
    </Container>
  );
};

const Clock = styled.div`
  ${({ theme }) => css`
    width: fit-content;
    height: fit-content;
    padding: ${theme.spacing[4]};
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 100%;
    background-color: ${theme.backgroundColor.primary};
    box-shadow: 0px 0px 0px #f5f5f5, 0px 1px 2px rgba(0, 0, 0, 0.1);
    filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.2));
    border: 12px solid #f5f5f5;
  `}
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  min-height: 320px;
`;

export default FraudPrevention;
