import { IcoCloseSmall16 } from '@onefootprint/icons';
import { createFontStyles, Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type EntryChipProps = {
  label: string;
  onDelete: () => void;
};

const EntryChip = ({ label, onDelete }: EntryChipProps) => (
  <Container>
    <Label>{label}</Label>
    <Close onClick={onDelete}>
      <IcoCloseSmall16 />
    </Close>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: fit-content;
  `}
`;

const Label = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    padding: ${theme.spacing[1]} ${theme.spacing[3]} ${theme.spacing[1]} ${theme
      .spacing[4]};
    background-color: ${theme.backgroundColor.secondary};
    color: ${theme.color.primary};
  `}
`;

const Close = styled.button`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0 ${theme.spacing[3]} 0 ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};
    transition: background-color 0.1s;

    svg {
      path {
        fill: ${theme.color.quaternary};
        transition: fill 0.1s;
      }
    }

    &:before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      width: 1px;
      height: 100%;
      background-color: ${theme.borderColor.tertiary};
    }

    &:hover {
      background-color: ${theme.backgroundColor.senary};

      svg {
        path {
          fill: ${theme.color.primary};
        }
      }
    }
  `}
`;

export default EntryChip;
