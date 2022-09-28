import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';
import { media } from 'ui';

export type PagerProps = {
  max: number;
  onClick: (index: number) => void;
  value: number;
};

const Pager = ({ max, value, onClick }: PagerProps) => {
  const activeCount = Math.min(max, value);

  const handleClick = (index: number) => () => {
    onClick(index);
  };

  return (
    <Container
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={activeCount}
      role="progressbar"
    >
      {times(max).map(index => (
        <Button
          active={index === value}
          aria-label={`Slide ${index}`}
          key={index}
          onClick={handleClick(index)}
          type="button"
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[3]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: inline-flex;
    gap: ${theme.spacing[2]}px;
    padding: ${theme.spacing[3]}px;

    ${media.greaterThan('lg')`
      display: none;
    `}
  `}
`;

const Button = styled.button<{ active: boolean }>`
  ${({ active, theme }) => css`
    background: ${theme.color.primary};
    border-radius: ${theme.borderRadius[4]}px;
    border: none;
    cursor: pointer;
    height: ${theme.spacing[3]}px;
    margin: 0;
    opacity: 0.3;
    padding: 0;
    width: ${theme.spacing[3]}px;

    ${active &&
    css`
      opacity: 1;
    `}
  `}
`;

export default Pager;
