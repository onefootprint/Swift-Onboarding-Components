import { Shimmer, Stack } from '@onefootprint/ui';
import React from 'react';

const Loading = () => (
  <Stack testID="members-roles-loading" width="100%">
    <Stack direction="column" gap={4} marginBottom={5}>
      <Stack direction="column" gap={3}>
        <EmailLabel />
        <EmailInput />
      </Stack>
      <Stack direction="column" gap={3}>
        <RoleLabel />
        <RoleInput />
      </Stack>
    </Stack>
    <AddMoreButton />
  </Stack>
);

const EmailLabel = () => <Shimmer height="20px" width="93px" />;

const EmailInput = () => <Shimmer height="40px" width="395px" />;

const RoleLabel = () => <Shimmer height="20px" width="93px" />;

const RoleInput = () => <Shimmer height="40px" width="194px" />;

const AddMoreButton = () => <Shimmer height="21px" width="86px" />;

export default Loading;
