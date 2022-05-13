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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border-right: ${theme.borderWidth[1]}px dashed #c2cbc3;
    border-bottom: ${theme.borderWidth[1]}px dashed #c2cbc3;

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
      cursor: pointer;
    `}

  p {
    visibility: hidden;
  }

  &:hover p {
    z-index: 5;
    visibility: visible;
    position: absolute;
    width: max-content;
    top: -25px;
  }
`;

export default PlaygroundSquare;
