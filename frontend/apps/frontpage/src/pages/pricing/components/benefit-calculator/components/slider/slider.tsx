import type { Spacing } from '@onefootprint/design-tokens';
import { media } from '@onefootprint/ui';
import * as RadixSlider from '@radix-ui/react-slider';
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

type SliderProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number[]) => void;
};

const Slider = ({ min, max, step, value, onChange }: SliderProps) => {
  const SLIDER_BASE_HEIGHT = 5;
  return (
    <SliderRoot
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={onChange}
      $baseHeight={SLIDER_BASE_HEIGHT}
      minStepsBetweenThumbs={step}
    >
      <SliderTrack $baseHeight={SLIDER_BASE_HEIGHT}>
        <SliderRange />
      </SliderTrack>
      <Thumb $baseHeight={SLIDER_BASE_HEIGHT} />
    </SliderRoot>
  );
};
const SliderRoot = styled(motion(RadixSlider.Root))<{ $baseHeight: Spacing }>`
  ${({ theme, $baseHeight }) => css`
    position: relative;
    display: flex;
    align-items: center;
    user-select: none;
    touch-action: none;
    width: 100%;
    cursor: pointer;
    height: ${theme.spacing[$baseHeight]};
  `}
`;

const SliderTrack = styled(RadixSlider.Track)<{ $baseHeight: Spacing }>`
  ${({ theme, $baseHeight }) => css`
    position: relative;
    overflow: hidden;
    flex-grow: 1;
    height: 100%;
    border-radius: ${theme.borderRadius.sm};
    background: ${theme.borderColor.tertiary};
    height: ${`calc(${$baseHeight} - ${theme.spacing[1]})`};
    transform-origin: center center;
    transition: height 0.1s ease-in-out;

    ${media.greaterThan('md')`
      height: ${`calc(${theme.spacing[$baseHeight]} - ${theme.spacing[2]})`};

      &:hover {
        height: ${theme.spacing[$baseHeight]};
      }
    `}
  `}
`;

const SliderRange = styled(RadixSlider.Range)`
  ${({ theme }) => css`
    position: absolute;
    height: 100%;
    background: ${theme.color.accent};
  `}
`;

const Thumb = styled(RadixSlider.Thumb)<{ $baseHeight: Spacing }>`
  ${({ theme, $baseHeight }) => css`
    box-sizing: border-box;
    display: block;
    width: ${theme.spacing[5]};
    height: calc(${theme.spacing[$baseHeight]} + ${theme.spacing[2]} * 2);
    border-radius: ${theme.borderRadius.sm};
    background: ${theme.color.accent};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.primary};
    cursor: pointer;

    &:focus-visible {
      box-shadow: 0 0 0 ${theme.borderWidth[2]} ${theme.color.accent}40;
      outline: none;
    }
  `}
`;
export default Slider;
