import { Box, Text } from '@onefootprint/ui';

import H1 from '../markdown-components/h1';

type ArticleHeaderProps = {
  title: string;
  subtitle: string;
};

const ArticleHeader = ({ title, subtitle }: ArticleHeaderProps) => (
  <Box marginBottom={8}>
    <H1>{title}</H1>
    <Text color="tertiary" variant="label-3">
      {subtitle}
    </Text>
  </Box>
);

export default ArticleHeader;
