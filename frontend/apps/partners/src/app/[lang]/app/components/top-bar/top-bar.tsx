import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Box, Text } from '@onefootprint/ui';
import Link from 'next/link';
import styled, { css } from 'styled-components';

import { DEFAULT_PRIVATE_ROUTE } from '@/config/constants';

const TopBar = () => (
  <Box
    backgroundColor="primary"
    paddingInline={7}
    maxHeight="48px"
    width="100%"
    borderBottomWidth={1}
    borderColor="primary"
    borderStyle="solid"
  >
    <Link href={DEFAULT_PRIVATE_ROUTE} aria-label="Home">
      <Box tag="span" position="relative" display="flex" alignItems="center" paddingTop={4} paddingBottom={4}>
        <ThemedLogoFpCompact color="primary" />
        <Pipe />
        <Text variant="label-3">Partners</Text>
      </Box>
    </Link>
  </Box>
);

const Pipe = styled.span`
  ${({ theme }) => css`
    height: 16px;
    border-right: 1px solid ${theme.borderColor.tertiary};
    margin-right: ${theme.spacing[3]};
    margin-left: ${theme.spacing[3]};
  `};
`;

export default TopBar;
