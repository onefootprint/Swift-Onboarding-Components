import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import pickBy from 'lodash/pickBy';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';

import { Event } from '../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../decrypt-machine-provider';
import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdentitySection from './components/identity-section';

type DecryptBasicInfoProps = {
  user: User;
};

type FormData = Omit<
  Record<UserDataAttribute, boolean>,
  UserDataAttribute.firstName | UserDataAttribute.lastName
>;

const DecryptBasicInfo = ({ user }: DecryptBasicInfoProps) => {
  const { t } = useTranslation('pages.user-details');
  const [state, send] = useDecryptMachine();
  const formMethods = useForm<FormData>({
    defaultValues: state.context.fields,
  });
  const { handleSubmit } = formMethods;
  const toast = useToast();
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);

  const handleBeforeSubmit = (formData: FormData) => {
    const fields = pickBy(formData);
    const hasAtLeastOneFieldSelected = Object.keys(fields).length > 0;
    if (hasAtLeastOneFieldSelected) {
      if (fields[UserDataAttribute.firstName]) {
        fields[UserDataAttribute.lastName] = true;
      }
      send({ type: Event.submittedFields, payload: { fields } });
    } else {
      toast.show({
        description: t('decrypt.errors.min-selected.description'),
        title: t('decrypt.errors.min-selected.title'),
        variant: 'error',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleBeforeSubmit)} id="decrypt-form">
      <FormProvider {...formMethods}>
        <DataGrid
          data-show-only-basic-data={
            !sectionsVisibility.address && !sectionsVisibility.identity
          }
        >
          <BasicSection user={user} />
          {sectionsVisibility.identity && <IdentitySection user={user} />}
          {sectionsVisibility.address && <AddressSection user={user} />}
        </DataGrid>
      </FormProvider>
    </form>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    &[data-show-only-basic-data='false'] {
      display: grid;
      gap: ${theme.spacing[5]}px;
      grid-template: auto auto / repeat(2, minmax(0, 1fr));
    }
  `};
`;

export default DecryptBasicInfo;
