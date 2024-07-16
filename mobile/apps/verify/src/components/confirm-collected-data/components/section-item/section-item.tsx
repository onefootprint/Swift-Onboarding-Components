import type { Color } from '@onefootprint/design-tokens';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

export type SectionItemProps = {
  text: string;
  textColor?: Color;
  subtext?: string;
};

const SectionItem = ({ text, subtext, textColor = 'tertiary' }: SectionItemProps) => (
  <Container>
    <Typography variant="label-3" color={textColor}>
      {text}
    </Typography>
    {subtext && <Typography variant="body-3">{subtext}</Typography>}
  </Container>
);

const Container = styled.View`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
  `}
`;

export default SectionItem;
