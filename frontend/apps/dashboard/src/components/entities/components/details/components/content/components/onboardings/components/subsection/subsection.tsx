import type { Icon } from '@onefootprint/icons';
import { Divider, Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type SubsectionProps = {
  icon: Icon;
  title: string;
  children: React.ReactNode;
};

const Subsection = ({ icon: Icon, title, children }: SubsectionProps) => (
  <Stack direction="column" gap={5}>
    <Stack gap={3} align="center">
      <Icon />
      <Text variant="label-2">{title}</Text>
    </Stack>
    <Divider variant="secondary" />
    {children}
  </Stack>
);

export default Subsection;
