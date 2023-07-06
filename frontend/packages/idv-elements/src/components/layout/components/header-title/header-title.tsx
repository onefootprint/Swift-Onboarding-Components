import { Box, SXStyleProps, Typography } from '@onefootprint/ui';
import React from 'react';

export const HEADER_TITLE_DEFAULT_ID = 'header-title';
export const HEADER_TITLE_CONTAINER_DEFAULT_ID = 'header-title-container';

export type HeaderTitleProps = {
  title: string;
  titleElementId?: string;
  subtitle?: string;
  sx?: SXStyleProps;
};

const HeaderTitle = ({
  title,
  subtitle,
  sx,
  titleElementId = HEADER_TITLE_DEFAULT_ID,
}: HeaderTitleProps) => (
  <Box
    sx={{ textAlign: 'center', ...sx }}
    id={HEADER_TITLE_CONTAINER_DEFAULT_ID}
  >
    <Typography as="h2" color="primary" variant="heading-3" id={titleElementId}>
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="body-2"
        color="secondary"
        as="h3"
        sx={{ marginTop: 3 }}
      >
        {subtitle}
      </Typography>
    )}
  </Box>
);

export default HeaderTitle;
