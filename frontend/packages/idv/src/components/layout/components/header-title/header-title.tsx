import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { SXStyleProps } from '@onefootprint/ui';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';

export const HEADER_TITLE_DEFAULT_ID = 'header-title';

export type HeaderTitleProps = {
  title: string;
  titleElementId?: string;
  subtitle?: string;
  sx?: SXStyleProps;
  icon?: Icon;
};

const HeaderTitle = ({
  title,
  subtitle,
  sx,
  titleElementId = HEADER_TITLE_DEFAULT_ID,
  icon: Icon,
}: HeaderTitleProps) => (
  <Stack
    textAlign="center"
    direction="column"
    align="center"
    gap={3}
    // @ts-ignore fix this later
    sx={{ ...sx }}
  >
    {Icon && (
      <IconContainer align="center" justify="center">
        <Icon />
      </IconContainer>
    )}
    <Stack direction="column" align="center" gap={3}>
      <Typography
        as="h2"
        color="primary"
        variant="heading-3"
        id={titleElementId}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body-2" color="secondary" as="h3">
          {subtitle}
        </Typography>
      )}
    </Stack>
  </Stack>
);

const IconContainer = styled(Stack)`
  ${({ theme }) => css`
    height: ${theme.spacing[8]};
    width: ${theme.spacing[8]};
    border: 1.5px solid ${theme.color.secondary};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

export default HeaderTitle;
