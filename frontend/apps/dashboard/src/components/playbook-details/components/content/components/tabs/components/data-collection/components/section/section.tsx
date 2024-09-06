import { Divider, Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type BorderedSectionProps = {
  title?: string;
  children: React.ReactNode;
  variant: 'default' | 'withDivider';
};

const Section = ({ title, variant, children }: BorderedSectionProps) => {
  if (variant === 'withDivider') {
    return (
      <Stack direction="column" gap={4} paddingBottom={7}>
        {!!title && (
          <Text variant="label-3" color="primary">
            {title}
          </Text>
        )}
        <Divider variant="secondary" />
        <Stack direction="column" gap={7}>
          {children}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap={5}>
      {!!title && (
        <Text variant="label-3" color="primary">
          {title}
        </Text>
      )}
      <Stack direction="column" gap={7}>
        {children}
      </Stack>
    </Stack>
  );
};

export default Section;
