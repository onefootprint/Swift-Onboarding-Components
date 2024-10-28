import type { HostedBusinessOwner } from '@onefootprint/request-types';
import { fn } from '@onefootprint/storybook-utils';
import { IdDI } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import type { Meta, StoryFn } from '@storybook/react';
import ImmutableBosList, { type ImmutableBosListProps } from './components/immutable-bos-list';
import MutableBosForm, { type MutableBosFormProps } from './components/mutable-bos-form';
import getDefaultFormValues from './utils/get-default-form-values';

const DefaultHeader = () => {
  return (
    <Stack direction="column" gap={3} marginBottom={3}>
      <Text variant="heading-3" textAlign="center">
        Add beneficial owners
      </Text>
      <Text variant="body-2" textAlign="center">
        List all individuals who own at least 25% of the business or have substantial control over it. Spell first,
        middle and last names exactly as shown on everyone's government-issued ID.
      </Text>
    </Stack>
  );
};

type BeneficialOwnersProps = {
  listProps: ImmutableBosListProps;
  formProps: MutableBosFormProps;
};

const Template: StoryFn<BeneficialOwnersProps> = ({ listProps, formProps }) => {
  return (
    <>
      <DefaultHeader />
      <ImmutableBosList {...listProps} />
      <MutableBosForm {...formProps} />
    </>
  );
};

const mockBos: HostedBusinessOwner[] = [
  {
    uuid: 'bo_link_primary',
    hasLinkedUser: true,
    isAuthedUser: true,
    isMutable: true,
    decryptedData: {
      [IdDI.firstName]: 'Jane',
      [IdDI.lastName]: 'Doe',
      [IdDI.phoneNumber]: '+1234567890',
      [IdDI.email]: 'jane.doe@example.com',
    },
    populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
    ownershipStake: 40,
    linkId: 'bo_link_primary',
  },
  {
    uuid: 'bo_link_secondary',
    hasLinkedUser: false,
    isAuthedUser: false,
    isMutable: true,
    decryptedData: {
      [IdDI.firstName]: 'John',
      [IdDI.lastName]: 'Smith',
      [IdDI.phoneNumber]: '+1987654321',
      [IdDI.email]: 'john.smith@example.com',
    },
    populatedData: [IdDI.firstName, IdDI.lastName, IdDI.phoneNumber, IdDI.email],
    ownershipStake: 35,
    linkId: 'bo_link_secondary',
  },
];
const immutableBos = mockBos.filter(bo => !bo.isMutable);

export const Default: StoryFn<BeneficialOwnersProps> = () => {
  const listProps: ImmutableBosListProps = {
    immutableBos,
    onSubmit: console.log,
  };

  const formProps: MutableBosFormProps = {
    existingBos: mockBos,
    onSubmit: console.log,
    defaultFormValues: getDefaultFormValues(mockBos, {}, {}),
    isLive: true,
  };

  return <Template listProps={listProps} formProps={formProps} />;
};

export default {
  component: Template,
  title: 'BeneficialOwners',
  args: {
    formProps: {
      existingBos: mockBos,
      onSubmit: fn(),
      defaultFormValues: getDefaultFormValues(mockBos, {}, {}),
      isLive: true,
    },
    listProps: {
      immutableBos,
      onSubmit: fn(),
    },
  },
} satisfies Meta<typeof Template>;
