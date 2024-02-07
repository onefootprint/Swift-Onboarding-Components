import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
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
        <Typography as="span" variant="label-4" color="quaternary">
          {`${texts.verified}`}
        </Typography>
      </Stack>
    ) : null}
    <Typography variant="label-4" color="quaternary">
      ·
    </Typography>
    <Typography as="span" variant="label-4" color="accent">
      {isEmpty ? texts.add : texts.edit}
    </Typography>
  </Stack>
);

export default RightActions;
