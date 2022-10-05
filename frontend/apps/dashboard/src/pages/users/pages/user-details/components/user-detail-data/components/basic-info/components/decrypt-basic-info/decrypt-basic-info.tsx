import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Box, useToast } from '@onefootprint/ui';
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
  const showIdentity = sectionsVisibility.identity;
  const showAddress = sectionsVisibility.address;

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
        <DataGrid>
          <BasicSection user={user} />
          {showIdentity && <IdentitySection user={user} />}
          {showAddress && (
            <Box
              sx={{
                gridRow: showIdentity ? '1 / span 2' : undefined,
                gridColumn: '2 / 2',
              }}
            >
              <AddressSection user={user} />
            </Box>
          )}
        </DataGrid>
      </FormProvider>
    </form>
  );
};

const DataGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default DecryptBasicInfo;
