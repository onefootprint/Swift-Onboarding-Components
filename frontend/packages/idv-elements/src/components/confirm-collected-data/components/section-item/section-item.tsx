import type { Color } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

export type SectionItemProps = {
  text: string;
  textColor?: Color;
  subtext?: string;
};

const SectionItem = ({
  text,
  subtext,
  textColor = 'tertiary',
}: SectionItemProps) => (
  <Container>
    <Typography variant="label-3" color={textColor} isPrivate>
      {text}
    </Typography>
    {subtext && (
      <Typography variant="body-3" isPrivate>
        {subtext}
      </Typography>
    )}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
  `}
`;

export default SectionItem;
