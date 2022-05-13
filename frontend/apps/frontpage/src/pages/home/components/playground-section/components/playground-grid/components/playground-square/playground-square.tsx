import React from 'react';
import styled, { css } from 'styled';
import { Typography } from 'ui';

type PlaygroundSquareProps = {
  lastColumn: boolean;
  isSelected: boolean;
  text: string;
};

const PlaygroundSquare = ({
  lastColumn,
  isSelected,
  text,
}: PlaygroundSquareProps) =>
  isSelected ? (
    <Square lastColumn={lastColumn} isSelected={isSelected}>
      <Typography variant="caption-1" color="primary" as="p">
        {text}
      </Typography>
    </Square>
  ) : (
    <Square lastColumn={lastColumn} isSelected={isSelected} />
  );

const Square = styled.li<{ lastColumn: boolean; isSelected: boolean }>`
  ${({ theme }) => css`
    align-items: center;
    border-bottom: ${theme.borderWidth[1]}px dashed #c2cbc3;
    border-right: ${theme.borderWidth[1]}px dashed #c2cbc3;
    display: flex;
    justify-content: center;
    position: relative;
    transition: background 100ms ease 0s;

    &:first-child {
      border-top-left-radius: ${theme.borderRadius[1]}px;
    }

    &:last-child {
      border-bottom-right-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(14) {
      border-bottom-left-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(505) {
      border-top-right-radius: ${theme.borderRadius[1]}px;
    }

    &:nth-child(14n) {
      border-bottom: none;
    }
  `}

  ${({ lastColumn }) =>
    lastColumn &&
    css`
      border-right: none;
    `}

  &:hover {
    background: #c2cbc3;
  }

  ${({ isSelected }) =>
    isSelected &&
    css`
      background: #c2cbc3;
      cursor: crosshair;
    `}

  p {
    opacity: 0;
    position: absolute;
    top: 0;
    transition: all 200ms ease;
    visibility: hidden;
    width: max-content;
    z-index: 5;
    pointer-events: none;
  }

  &:hover p {
    opacity: 1;
    top: ${({ theme }) => -theme.spacing[7]}px;
    visibility: visible;
  }
`;

export default PlaygroundSquare;
