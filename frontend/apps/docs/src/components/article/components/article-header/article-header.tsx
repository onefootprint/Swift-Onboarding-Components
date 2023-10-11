import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import H1 from '../markdown-components/h1';

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
};

const ArticleHeader = ({ title, subtitle }: ArticleHeaderProps) => (
  <Box marginBottom={8}>
    <H1>{title}</H1>
    <Typography color="tertiary" variant="label-3">
      {subtitle}
    </Typography>
  </Box>
);

export default ArticleHeader;
