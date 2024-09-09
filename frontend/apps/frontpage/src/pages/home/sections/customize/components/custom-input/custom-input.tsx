import { Box, Text } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import type React from 'react';
import styled, { css } from 'styled-components';

type CustomInputTypes = {
  title: string;
  type: 'text' | 'number' | 'radio-group';
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
};

const CardMotionVariants = {
  floating: {
    y: ['0%', '-4%', '0%', '4%', '0%'],
    x: ['0%', '-4%', '0%', '4%', '0%'],
    rotate: ['-2deg', '3deg', '-2deg', '3deg', '-2deg'],
    transition: {
      x: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
        duration: 20,
        ease: 'easeInOut',
      },
      y: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
        duration: 15,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'mirror',
        duration: 15,
        ease: 'easeInOut',
      },
    },
  },
};

const CustomInput = ({ title, type, value, onChange, className }: CustomInputTypes) => {
  const inputId = `input-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const formattedValue = type === 'text' ? `#${value}` : value;

  return (
    <Card className={className} variants={CardMotionVariants} initial="floating" animate="floating">
      <label htmlFor={inputId}>
        <Text variant="label-3">{title}</Text>
      </label>
      <StyledInput id={inputId} type={type} onChange={onChange} value={formattedValue} />
    </Card>
  );
};

const Card = styled(motion(Box))`
  ${({ theme }) => css`
    display: flex;
    z-index: 2;
    flex-direction: column;
    gap: ${theme.spacing[3]};
    width: ${theme.spacing[14]};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    padding: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const StyledInput = styled.input`
  ${({ theme }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[3]};
    -moz-appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `}
`;

export default CustomInput;
