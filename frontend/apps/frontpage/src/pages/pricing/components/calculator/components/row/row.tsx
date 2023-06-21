import { IcoMinusSmall24, IcoPlusSmall24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { createCheckedStyled, createPseudoStyles } from './row.utils';

type RowProps = {
  children: React.ReactNode;
  units: string;
  initialValue: number;
  delta: number;
  value: number;
  minimumValue: number;
  initialChecked?: boolean;
  disabled?: boolean;
  onChange: (value: number) => void;
};

const Row = ({
  value,
  children,
  units,
  initialValue,
  minimumValue,
  delta,
  initialChecked,
  disabled,
  onChange,
}: RowProps) => {
  // const [value, setValue] = useState(initialValue);
  const [showValues, setShowValues] = useState(initialChecked);
  const ref = useRef<HTMLInputElement>(null);

  const increaseValue = () => {
    const newValue = value + delta;
    onChange(newValue);
  };

  const decreaseValue = () => {
    if (value > minimumValue) {
      const newValue = value - delta;
      onChange(newValue);
    }
  };

  const handleCheckboxChange = () => {
    const checked = ref.current?.checked;
    setShowValues(checked);
    if (!checked) {
      onChange(0);
    } else {
      onChange(initialValue);
    }
  };

  const handleCheck = () => {
    if (ref.current?.checked) {
      ref.current.checked = false;
      handleCheckboxChange();
    } else {
      ref.current!.checked = true;
      handleCheckboxChange();
    }
  };

  return (
    <Container>
      <InputContainer>
        <Input
          id="checkbox"
          type="checkbox"
          defaultChecked={initialChecked}
          checked={showValues}
          disabled={disabled}
          onChange={handleCheckboxChange}
          ref={ref}
        />
        <Label
          onClick={() => (!disabled ? handleCheck() : null)}
          htmlFor="checkbox"
        >
          <Typography variant="label-2">{children}</Typography>
          <Typography variant="caption-4" color="secondary">
            {units}
          </Typography>
        </Label>
      </InputContainer>
      <AnimatePresence>
        {showValues && (
          <Values
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="button"
              onClick={decreaseValue}
              disabled={value <= minimumValue}
            >
              <IcoMinusSmall24 />
            </Button>
            <Typography variant="label-2" sx={{ marginTop: 2 }}>
              {value.toLocaleString('en-US')}
            </Typography>
            <Button type="button" onClick={increaseValue}>
              <IcoPlusSmall24 />
            </Button>
          </Values>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[2]} ${theme.spacing[4]};
    width: 100%;
    min-height: 64px;

    ${media.greaterThan('sm')`
      padding: ${theme.spacing[4]} ${theme.spacing[8]};
      height: 48px;
    `}
  `}
`;

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-start;
    justify-content: space-between;
    gap: ${theme.spacing[4]};
    overflow: hidden;
  `}
`;

const Input = styled.input`
  ${({ theme }) => css`
    appearance: none;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    display: grid;
    margin: 0;
    outline-offset: ${theme.spacing[2]};
    place-content: center;
    width: 20px;
    height: 20px;
    margin-top: 2px;
    flex-shrink: 0;

    &::before {
      content: '';
      width: 0.7em;
      height: 0.7em;
      transform: scale(0);
      transition: 100ms transform ease-in-out;
    }

    &:checked {
      background-color: ${theme.backgroundColor.tertiary};
      border-color: transparent;
      ${createPseudoStyles({
        hoverOverlay: 'lighten-1',
        activeOverlay: 'lighten-2',
        background: 'tertiary',
      })}

      &::before {
        ${createCheckedStyled('quinary')};
      }
    }

    &:disabled {
      cursor: initial;
      background-color: ${theme.backgroundColor.senary};
      border-color: transparent;

      &:checked::before {
        ${createCheckedStyled('quaternary')};
      }
    }
  `}
`;

const Label = styled.label`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: flex-start;
    gap: ${theme.spacing[1]};
    margin-top: 0;
    cursor: pointer;
    flex-wrap: wrap;
  `}
`;

const Values = styled(motion.div)`
  ${({ theme }) => css`
    min-width: 132px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[4]};
  `}
`;

const Button = styled.button`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[1]};
    cursor: pointer;

    @media (hover: hover) {
      &:hover {
        background-color: ${theme.backgroundColor.secondary};
        border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      }
    }

    &:active {
      background-color: ${theme.backgroundColor.secondary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    }

    &:disabled {
      cursor: initial;
      background-color: ${theme.backgroundColor.secondary};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};

      svg {
        path {
          stroke: ${theme.color.tertiary};
        }
      }
    }
  `}
`;

export default Row;
