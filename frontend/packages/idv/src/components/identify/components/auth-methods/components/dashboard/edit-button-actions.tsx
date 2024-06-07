import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

type EditButtonActionsProps = {
  isEmpty: boolean;
  shouldShowVerify: boolean;
  texts: {
    add: string;
    edit: string;
    verified: string;
  };
};

const EditButtonActions = ({ shouldShowVerify, isEmpty, texts }: EditButtonActionsProps) => (
  <Stack direction="row" align="center" gap={3} justify="flex-end">
    {shouldShowVerify ? (
      <>
        <Stack gap={1} align="center">
          <IcoCheckSmall16 color="quaternary" />
          <Text tag="span" variant="label-4" color="quaternary">
            {`${texts.verified}`}
          </Text>
        </Stack>
        <Text variant="label-4" color="quaternary">
          ·
        </Text>
      </>
    ) : null}
    <Text tag="span" variant="label-4" color="accent">
      {isEmpty ? texts.add : texts.edit}
    </Text>
  </Stack>
);

export default EditButtonActions;
