import type { Color } from '@onefootprint/design-tokens';
import { Stack, Text } from '@onefootprint/ui';

export type SectionItemProps = {
  text: string;
  textColor?: Color;
  subtext?: string;
};

const SectionItem = ({ text, subtext, textColor = 'tertiary' }: SectionItemProps) => (
  <Stack direction="column" flexGrow={1} maxWidth="100%">
    <Text variant="label-3" color={textColor} isPrivate>
      {text}
    </Text>
    {subtext && (
      <Text variant="body-3" isPrivate truncate>
        {subtext}
      </Text>
    )}
  </Stack>
);

export default SectionItem;
