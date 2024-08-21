import { Box, Stack, Text } from '@onefootprint/ui';
import type React from 'react';

type BorderedSectionProps = { title?: string; children: React.ReactNode; type: 'withBorders' | 'default' };

const Section = ({ title, type, children }: BorderedSectionProps) => {
  if (type === 'withBorders') {
    return (
      <Box borderWidth={1} borderStyle="solid" borderRadius="default" borderColor="tertiary">
        <Stack direction="column" gap={5}>
          {!!title && (
            <Box paddingInline={7} paddingBlock={5} borderBottomWidth={1} borderStyle="solid" borderColor="tertiary">
              <Text variant="label-3" color="primary">
                {title}
              </Text>
            </Box>
          )}
          <Stack direction="column" gap={7} paddingInline={7} paddingBottom={7}>
            {children}
          </Stack>
        </Stack>
      </Box>
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
