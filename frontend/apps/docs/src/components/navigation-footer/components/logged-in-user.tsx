import { IcoUserCircle16 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';

import useSession from 'src/hooks/use-session';
import NavDropdown from './nav-dropdown';

const LoggedInUser = () => {
  const {
    data: { user },
  } = useSession();
  if (!user) {
    return null;
  }
  const { firstName, lastName, email } = user;
  const userName = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined;
  return (
    <Box borderBottomWidth={1} borderColor="tertiary" borderStyle="solid">
      <Box marginBottom={5} marginLeft={6} marginRight={6} marginTop={5}>
        <Stack direction="row" align="center" justify="space-between" width="100%" maxWidth="100%" gap={3}>
          <Box>
            <IcoUserCircle16 color="tertiary" />
          </Box>
          <Text variant="label-4" color="tertiary" truncate width="100%" marginBottom={1}>
            {userName || email}
          </Text>
          <Box>
            <NavDropdown name={userName} email={email} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoggedInUser;
