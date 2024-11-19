import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';

export type PanelProps = {
  children: React.ReactNode;
  cta?: React.ReactNode;
  title: string;
};

const Panel = ({ children, cta, title }: PanelProps) => {
  return (
    <Stack
      tag="section"
      aria-label={title}
      flexDirection="column"
      width="100%"
      paddingBlock={5}
      paddingInline={6}
      gap={6}
      borderColor="tertiary"
      borderRadius="default"
      borderStyle="solid"
      borderWidth={1}
    >
      <Stack tag="header" flexDirection="row" justifyContent="space-between" width="100%">
        <Text variant="label-3">{title}</Text>
        {cta}
      </Stack>
      {children}
    </Stack>
  );
};

export default Panel;
