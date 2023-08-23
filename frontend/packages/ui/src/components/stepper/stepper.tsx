import { IcoCheckCircle16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import React, { Fragment } from 'react';

import { createFontStyles } from '../../utils';

export type StepperOption = {
  label: string;
  value: string;
};

export type StepperProps = {
  'aria-label': string;
  onChange?: (option: StepperOption) => void;
  options: StepperOption[];
  value: StepperOption;
};

const Stepper = ({
  'aria-label': ariaLabel,
  onChange,
  options,
  value: selectedOption,
}: StepperProps) => {
  const valueIndex = options.findIndex(
    option => option.value === selectedOption.value,
  );

  const handleClick = (option: StepperOption) => () => {
    onChange?.(option);
  };

  return (
    <Nav aria-label={ariaLabel}>
      <ul>
        {options.map((option, index) => {
          const isCompleted = valueIndex > index;
          const isDisabled = valueIndex < index;
          const isSelected = selectedOption.value === option.value;
          const isLast = index === options.length - 1;

          return (
            <Fragment key={option.value}>
              <Item
                data-completed={isCompleted}
                data-disabled={isDisabled}
                data-selected={isSelected}
              >
                <IconContainer>
                  {isCompleted && <IcoCheckCircle16 />}
                  {isDisabled && <DotDisabled />}
                  {isSelected && <DotSelected />}
                </IconContainer>
                <button
                  type="button"
                  onClick={handleClick(option)}
                  disabled={isDisabled}
                >
                  {option.label}
                </button>
              </Item>
              {isLast ? null : (
                <Connector
                  data-completed={isCompleted}
                  data-disabled={isDisabled}
                  data-selected={isSelected}
                />
              )}
            </Fragment>
          );
        })}
      </ul>
    </Nav>
  );
};

const Nav = styled.nav`
  ${({ theme }) => css`
    ul {
      display: inline-flex;
      gap: ${theme.spacing[1]};
      flex-direction: column;

      button {
        background: none;
        border: none;
        box-shadow: none;
        text-align: left;
      }
    }
  `};
`;

const Item = styled.li`
  ${({ theme }) => css`
    align-items: center;
    display: inline-grid;
    gap: ${theme.spacing[5]};
    grid-template-columns: ${theme.spacing[5]} auto;

    &[data-disabled='true'] {
      button {
        ${createFontStyles('body-3')};
        color: ${theme.color.tertiary};
      }
    }

    &[data-completed='true'] {
      button {
        ${createFontStyles('body-3')};
        color: ${theme.color.primary};
        cursor: pointer;
      }

      &:hover button {
        opacity: 0.7;
      }
    }

    &[data-selected='true'] {
      button {
        ${createFontStyles('label-3')};
        color: ${theme.color.accent};
        cursor: pointer;
      }

      &:hover button {
        opacity: 0.75;
      }
    }
  `};
`;

const IconContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const DotDisabled = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius.full};
    height: ${theme.spacing[3]};
    opacity: 0.45;
    width: ${theme.spacing[3]};
  `};
`;

const DotSelected = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
    border-radius: ${theme.borderRadius.full};
    box-shadow: 0px 0px 0px ${theme.borderRadius.compact} rgba(74, 36, 219, 0.2);
    height: ${theme.spacing[3]};
    width: ${theme.spacing[3]};
  `};
`;

const Connector = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    height: 12px;
    margin-left: calc(${theme.spacing[3]} - 1px);
    width: 2px;

    &[data-disabled='true'] {
      background-color: ${theme.backgroundColor.tertiary};
      opacity: 0.45;
    }

    &[data-completed='true'] {
      background-color: ${theme.backgroundColor.tertiary};
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.accent};
    }
  `};
`;

export default Stepper;
