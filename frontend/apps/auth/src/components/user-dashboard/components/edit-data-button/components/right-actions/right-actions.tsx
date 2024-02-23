import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type RightActionsProps = {
  shouldShowVerify: boolean;
  isEmpty: boolean;
  texts: {
    add: string;
    edit: string;
    verified: string;
  };
};

const RightActions = ({
  shouldShowVerify,
  isEmpty,
  texts,
}: RightActionsProps) => (
  <Stack direction="row" align="center" gap={2} justify="flex-end">
    {shouldShowVerify ? (
      <Stack gap={1} align="center">
        <IcoCheckSmall16 color="quaternary" />
        <Text as="span" variant="label-4" color="quaternary">
          {`${texts.verified}`}
        </Text>
      </Stack>
    ) : null}
    <Text variant="label-4" color="quaternary">
      ·
    </Text>
    <Text as="span" variant="label-4" color="accent">
      {isEmpty ? texts.add : texts.edit}
    </Text>
  </Stack>
);

export default RightActions;
