import type { Color } from '@onefootprint/design-tokens';
import { Text } from '@onefootprint/ui';
import React from 'react';

export type SectionItemProps = {
  text: string;
  textColor?: Color;
  subtext?: string;
};

const SectionItem = ({
  text,
  subtext,
  textColor = 'tertiary',
}: SectionItemProps) => (
  <div>
    <Text variant="label-3" color={textColor} isPrivate>
      {text}
    </Text>
    {subtext && (
      <Text variant="body-3" isPrivate>
        {subtext}
      </Text>
    )}
  </div>
);

export default SectionItem;
