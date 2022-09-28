import type { Color, FontVariant } from '@onefootprint/themes';
import React from 'react';
import styled, { css } from 'styled-components';

import Typography from '../../typography';

export type HintProps = {
  children: string;
  className?: string;
  color: Color;
  id?: string;
  variant?: FontVariant;
};

const Hint = ({
  children,
  className,
  color,
  id,
  variant = 'caption-2',
}: HintProps) => (
  <Container id={id} className={className}>
    <Typography as="p" color={color} variant={variant}>
      {children}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[3]}px;
    text-align: left;
  `}
`;

export default Hint;
