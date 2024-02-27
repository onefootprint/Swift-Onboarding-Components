import type { Icon } from '@onefootprint/icons';
import type { SXStyleProps } from '@onefootprint/ui';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export const HEADER_TITLE_DEFAULT_ID = 'header-title';

export type HeaderTitleProps = {
  title: string | JSX.Element;
  titleElementId?: string;
  subtitle?: string | JSX.Element;
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
      <Text tag="h2" color="primary" variant="heading-3" id={titleElementId}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body-2" color="secondary" tag="h3">
          {subtitle}
        </Text>
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
  `}
`;

export default HeaderTitle;
