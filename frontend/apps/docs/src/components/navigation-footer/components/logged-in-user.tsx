import { IcoUserCircle16 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';

import type { User } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';
import { useEffectOnce } from 'usehooks-ts';

type LoggedInUserProps = {
  user: User;
  children: React.ReactElement;
};

const LoggedInUser = ({ user, children }: LoggedInUserProps) => {
  const { firstName, lastName, email } = user;
  const userName = firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined;
  const { refreshPermissions } = useSession();

  useEffectOnce(() => {
    refreshPermissions().catch(() => {
      // No-op on error
      return;
    });
  });

  return (
    <Box borderBottomWidth={1} borderColor="tertiary" borderStyle="solid">
      <Box marginBottom={4} marginLeft={6} marginRight={6} marginTop={4}>
        <Stack direction="row" width="100%" maxWidth="100%" gap={3} alignItems="center">
          <Box marginTop={2} marginBottom={6} height={'100%'}>
            <IcoUserCircle16 color="tertiary" />
          </Box>
          <Stack direction="column" width="100%" maxWidth="100%" overflow="auto">
            <Text variant="body-3" color="primary" truncate width="100%">
              {userName || email}
            </Text>
            <Text variant="body-4" color="tertiary" truncate width="100%">
              {user.tenant.name}
            </Text>
          </Stack>
          <Box>{children}</Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoggedInUser;
