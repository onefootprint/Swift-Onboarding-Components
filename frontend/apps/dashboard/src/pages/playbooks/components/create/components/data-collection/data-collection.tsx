import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type GroupProps = {
  title: string;
  children: React.ReactNode;
};

const Group = ({ title, children }: GroupProps) => {
  return (
    <Stack flexDirection="column" gap={5}>
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
  children?: React.ReactNode;
};

const Item = ({ label, checked, children }: ItemProps) => {
  return (
    <Stack
      aria-label={label}
      // biome-ignore lint/a11y/useSemanticElements: TODO: change to <tr />
      role="row"
      height="24px"
      justifyContent="space-between"
      width="100%"
      gap={10}
    >
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
      {typeof checked === 'boolean' ? (
        <Stack>{checked ? <IcoCheck24 aria-label="Enabled" /> : <IcoCloseSmall24 aria-label="Disabled" />}</Stack>
      ) : (
        children
      )}
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
