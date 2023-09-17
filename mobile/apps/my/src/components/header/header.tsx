import { Box } from '@onefootprint/ui';
import React from 'react';

type HeaderProps = {
  children?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
};

const Header = ({ children, headerLeft, headerRight }: HeaderProps) => {
  return (
    <Box alignItems="center" flexDirection="row" justifyContent="space-between">
      <Box flex={1}>{headerLeft}</Box>
      <Box>{children}</Box>
      <Box flex={1}>{headerRight}</Box>
    </Box>
  );
};

export default Header;
