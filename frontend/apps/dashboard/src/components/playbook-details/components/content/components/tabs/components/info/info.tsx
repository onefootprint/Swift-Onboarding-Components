import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type GroupProps = {
  title: string;
  children: React.ReactNode;
};

const Group = ({ title, children }: GroupProps) => {
  return (
    <Stack flexDirection="column" gap={5} aria-label={title} role="group">
      <Text variant="label-3">{title}</Text>
      <Stack flexDirection="column" gap={2}>
        {children}
      </Stack>
    </Stack>
  );
};

type ItemProps = {
  label: string;
  checked?: boolean;
};

const Item = ({ label, checked }: ItemProps) => {
  return (
    <Stack aria-label={label} role="row" height="24px" justifyContent="space-between" width="100%" gap={10}>
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      <Stack>{checked ? <IcoCheck24 aria-label="Enabled" /> : <IcoCloseSmall24 aria-label="Disabled" />}</Stack>
    </Stack>
  );
};

const EmptyItem = ({ children }: React.PropsWithChildren) => {
  return (
    <Text variant="body-3" color="tertiary">
      {children}
    </Text>
  );
};

export default {
  Group,
  Item,
  EmptyItem,
};
