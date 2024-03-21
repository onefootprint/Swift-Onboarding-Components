import type { Icon } from '@onefootprint/icons';
import type { SXStyleProps } from '@onefootprint/ui';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

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
    {Icon && <Icon />}
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

export default HeaderTitle;
