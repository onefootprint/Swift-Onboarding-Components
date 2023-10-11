import type { Color, FontVariant } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type NavigationHeaderTitleProps = {
  title?: string;
  fontVariant?: FontVariant;
  fontColor?: Color;
};

const NavigationHeaderTitle = ({
  title,
  fontVariant,
  fontColor,
}: NavigationHeaderTitleProps) =>
  title ? (
    <Container>
      <Typography
        variant={fontVariant || 'label-2'}
        color={fontColor || 'primary'}
        sx={{
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
    </Container>
  ) : null;

const Container = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    // Don't overlap with the button
    max-width: calc(100% - ${theme.spacing[10]});
    isolation: isolate;
    z-index: 1;
  `}
`;

export default NavigationHeaderTitle;
