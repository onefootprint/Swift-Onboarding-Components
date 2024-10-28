import { IcoCheckSmall24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type GroupProps = {
  title: string;
  children: React.ReactNode;
};

const Group = ({ title, children }: GroupProps) => {
  return (
    <Stack flexDirection="column" gap={4} aria-label={title} role="group">
      <Text variant="label-2">{title}</Text>
      <Stack flexDirection="column" gap={2}>
        {children}
      </Stack>
    </Stack>
  );
};

type ItemProps = {
  label: string;
  hint?: string;
  checked?: boolean;
};

const Item = ({ label, hint, checked }: ItemProps) => {
  return (
    <Stack
      aria-label={label}
      role="row"
      height="24px"
      justifyContent="flex-start"
      width="100%"
      gap={3}
      alignItems="center"
    >
      {checked ? <IcoCheckSmall24 aria-label="Enabled" /> : <IcoCloseSmall24 aria-label="Disabled" />}
      <Text variant="body-2" color="secondary">
        {label}
      </Text>
      {hint && (
        <Text variant="body-2" color="tertiary">
          {hint}
        </Text>
      )}
    </Stack>
  );
};

export default {
  Group,
  Item,
};
