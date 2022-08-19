import React from 'react';
import { Box, Typography } from 'ui';

import H1 from '../h1';

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
};

const ArticleHeader = ({ title, subtitle }: ArticleHeaderProps) => (
  <Box sx={{ marginBottom: 8 }}>
    <H1>{title}</H1>
    <Typography color="tertiary" variant="label-3">
      {subtitle}
    </Typography>
  </Box>
);

export default ArticleHeader;
