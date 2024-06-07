import { Box, Stack, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type Color = {
  name: string;
  hex: string;
};

type ColorSelectionProps = {
  title: string;
  activeHex: Color['hex'];
  colorList: Color[];
  className?: string;
  onChange: (value: Color['hex']) => void;
};

const CardMotionVariants = {
  floating: {
    y: ['0%', '-4%', '0%', '4%', '0%'],
    x: ['0%', '-4%', '0%', '4%', '0%'],
    rotate: ['-2deg', '3deg', '-2deg', '3deg', '-2deg'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 25,
        ease: 'easeInOut',
      },
      y: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 15,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Infinity,
        repeatType: 'mirror',
        duration: 20,
        ease: 'easeInOut',
      },
    },
  },
};

const ColorSelection: React.FC<ColorSelectionProps> = ({ onChange, title, colorList, activeHex, className }) => (
  <Card className={className} variants={CardMotionVariants} initial="floating" animate="floating">
    <Text variant="label-4">{title}</Text>
    <Stack direction="row" inline gap={2}>
      {colorList.map(({ name, hex }) => (
        <Box key={name} width="100%">
          <StyledRadio
            type="radio"
            id={`color-${name}`}
            name="color-selection"
            value={hex}
            onChange={e => onChange(e.target.value)}
            checked={activeHex === hex}
          />
          <ColorButton
            selected={activeHex === hex}
            color={hex}
            onClick={() => onChange(hex)}
            aria-label={`Change color to ${name}`}
          />
        </Box>
      ))}
    </Stack>
  </Card>
);

const Card = styled(motion(Box))`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: ${theme.spacing[14]};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    padding: ${theme.spacing[3]};
    z-index: 2;
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const ColorButton = styled.button<{ selected: boolean; color: string }>`
  ${({ theme, selected, color }) => css`
    all: unset;
    width: 100%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    cursor: pointer;
    height: ${theme.spacing[8]};
    background-color: ${color};
    transition: outline 0.09s ease-out;

    ${
      selected &&
      css`
      outline: 2px solid ${theme.backgroundColor.primary};
      outline-offset: -4px;
    `
    }
  `}
`;

const StyledRadio = styled.input`
  display: none;
`;

export default ColorSelection;
