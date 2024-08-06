import { media } from '@onefootprint/ui';
import times from 'lodash/times';
import styled, { css } from 'styled-components';

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
    <Container aria-valuemax={max} aria-valuemin={0} aria-valuenow={activeCount} role="progressbar">
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
    border-radius: ${theme.borderRadius.xl};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: inline-flex;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]};

    ${media.greaterThan('lg')`
      display: none;
    `}
  `}
`;

const Button = styled.button<{ active: boolean }>`
  ${({ active, theme }) => css`
    background: ${theme.color.primary};
    border-radius: ${theme.borderRadius.full};
    border: none;
    cursor: pointer;
    height: ${theme.spacing[3]};
    margin: 0;
    opacity: 0.3;
    padding: 0;
    width: ${theme.spacing[3]};

    ${
      active &&
      css`
      opacity: 1;
    `
    }
  `}
`;

export default Pager;
