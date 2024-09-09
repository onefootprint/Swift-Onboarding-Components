import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';

type EditButtonActionsProps = {
  isDisabled?: boolean;
  isEmpty: boolean;
  shouldShowVerify: boolean;
  texts: {
    add: string;
    edit: string;
    verified: string;
  };
};

const EditButtonActions = ({ shouldShowVerify, isDisabled, isEmpty, texts }: EditButtonActionsProps) => (
  <Stack direction="row" align="center" gap={3} justify="flex-end">
    {shouldShowVerify ? (
      <>
        <Stack gap={1} align="center">
          <IcoCheckSmall16 color="quaternary" />
          <Text tag="span" variant="label-3" color="quaternary">
            {`${texts.verified}`}
          </Text>
        </Stack>
        <Text variant="label-3" color="quaternary">
          ·
        </Text>
      </>
    ) : null}
    <Text tag="span" variant="label-3" color={isDisabled ? 'quaternary' : 'accent'}>
      {isEmpty ? texts.add : texts.edit}
    </Text>
  </Stack>
);

export default EditButtonActions;
