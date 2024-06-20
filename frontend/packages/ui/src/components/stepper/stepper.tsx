import { IcoCheckSmall16 } from '@onefootprint/icons';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils';

export type StepperOption = {
  label: string;
  value: string;
  options?: {
    label: string;
    value: string;
  }[];
};

export type StepperProps = {
  'aria-label': string;
  onChange?: (option: StepperOption) => void;
  options: StepperOption[];
  value: { option: StepperOption; subOption?: StepperOption };
};

const Stepper = ({ 'aria-label': ariaLabel, onChange, options, value: selected }: StepperProps) => {
  const { option: selectedOption, subOption: selectedSubOption } = selected;
  const valueIndex = options.findIndex(option => option.value === selectedOption.value);
  const subValueIndex = selectedOption.options?.findIndex(option => option.value === selectedSubOption?.value);

  const handleClick = (option: StepperOption) => () => {
    onChange?.(option);
  };

  return (
    <Nav aria-label={ariaLabel}>
      <ul>
        {options.map((option, index) => {
          const isCompleted = valueIndex > index;
          const isNext = valueIndex < index;
          const isSelected = selectedOption.value === option.value;
          const isLast = index === options.length - 1;
          const position = index + 1;
          const subOptions = option.options || [];
          const showSubOptions = isSelected && subOptions.length > 0;

          return (
            <React.Fragment key={option.value}>
              <Item
                key={`${option.value}-${position}`}
                data-completed={isCompleted}
                data-next={isNext}
                data-selected={isSelected}
                data-sub={showSubOptions}
              >
                <IconContainer>
                  {isCompleted && (
                    <DotCompleted>
                      <IcoCheckSmall16 color="quinary" />
                    </DotCompleted>
                  )}
                  {isNext && <DotNext>{position}</DotNext>}
                  {isSelected && <DotSelected>{position}</DotSelected>}
                </IconContainer>
                <button type="button" onClick={handleClick(option)} disabled={isNext}>
                  {option.label}
                </button>
              </Item>
              {isLast ? null : <Connector data-completed={isCompleted} data-next={isNext} data-selected={isSelected} />}
              {showSubOptions && (
                <ul>
                  {subOptions.map((suboption, subIndex) => {
                    const isSubOptionSelected = selectedSubOption?.value === suboption.value;
                    const isSubOptionCompleted = (subValueIndex ?? 0) > subIndex;
                    const isSubOptionNext = (subValueIndex ?? 0) < subIndex;
                    return (
                      <React.Fragment key={suboption.value}>
                        <SubItem
                          key={`${suboption.value}-${subIndex}`}
                          data-completed={isSubOptionCompleted}
                          data-next={isSubOptionNext}
                          data-selected={isSubOptionSelected}
                        >
                          <IconContainer>
                            <SmallDot />
                          </IconContainer>
                          <button type="button" onClick={handleClick(suboption)} disabled={isSubOptionNext}>
                            {suboption.label}
                          </button>
                        </SubItem>
                        {isLast ? null : (
                          <Connector data-completed={isCompleted} data-next={isNext} data-selected={isSelected} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </ul>
              )}
            </React.Fragment>
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
    grid-template-columns: ${theme.spacing[6]} auto;

    &[data-next='true'] {
      button {
        ${createFontStyles('body-3')};
        color: ${theme.color.primary};
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

    &[data-sub='true'] {
      button {
        ${createFontStyles('body-3')};
        color: ${theme.color.primary};
      }
    }
  `};
`;

const IconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Dot = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('caption-3')};
    align-items: center;
    color: white;
    display: flex;
    height: ${theme.spacing[6]};
    justify-content: center;
    width: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.full};
  `};
`;

const DotNext = styled(Dot)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    color: ${theme.color.quinary};
  `};
`;

const DotSelected = styled(Dot)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
  `};
`;

const DotCompleted = styled(Dot)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.successInverted};
  `};
`;

const SubItem = styled.li`
  ${({ theme }) => css`
    align-items: center;
    display: inline-grid;
    gap: ${theme.spacing[8]};
    grid-template-columns: ${theme.spacing[6]} auto;
    height: calc(${theme.spacing[5]} + 1px);
    margin-top: calc(${theme.spacing[3]} * -1);

    &[data-next='true'] {
      button {
        ${createFontStyles('body-3')};
        color: ${theme.color.primary};
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

const SmallDot = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.accent};
    border-radius: ${theme.borderRadius.full};
    height: 6px;
    width: 6px;
  `};
`;

const Connector = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    height: ${theme.spacing[4]};
    margin-left: calc(${theme.spacing[4]} - ${theme.spacing[1]} - 1px);
    width: ${theme.borderWidth[2]};

    &[data-next='true'] {
      background-color: ${theme.backgroundColor.tertiary};
    }

    &[data-completed='true'] {
      background-color: ${theme.backgroundColor.successInverted};
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.accent};
    }
  `};
`;

export default Stepper;
