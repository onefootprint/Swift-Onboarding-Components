import { useTranslation } from 'hooks';
import { IcoBuilding24, IcoFileText224, IcoUserCircle24 } from 'icons';
import pickBy from 'lodash/pickBy';
import React from 'react';
import { useForm } from 'react-hook-form';
import { User } from 'src/pages/users/hooks/use-join-users';
import styled, { css } from 'styled-components';
import { UserDataAttribute } from 'types';
import { Checkbox, useToast } from 'ui';

import { Event } from '../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../decrypt-machine-provider';
import getSectionsVisibility from '../../utils/get-sections-visibility';
import DataContainer from '../data-container';

type DecryptBasicInfoProps = {
  user: User;
};

const UserDataAttributeFullName = 'fullName';

type FormData = Omit<
  Record<UserDataAttribute, boolean>,
  UserDataAttribute.firstName | UserDataAttribute.lastName
> & { [UserDataAttributeFullName]: boolean };

const DecryptBasicInfo = ({ user }: DecryptBasicInfoProps) => {
  const { t, allT } = useTranslation('pages.user-details');
  const [state, send] = useDecryptMachine();
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: state.context.fields,
  });
  const toast = useToast();
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);

  const isCheckboxDisabled = (value?: string | null) => value !== undefined;

  const handleBeforeSubmit = (formData: FormData) => {
    const fields = pickBy(formData);
    const hasAtLeastOneFieldSelected = Object.keys(fields).length > 0;
    if (hasAtLeastOneFieldSelected) {
      if (fields[UserDataAttributeFullName]) {
        delete fields[UserDataAttributeFullName];
        fields[UserDataAttribute.firstName] = true;
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
      <DataGrid
        data-show-only-basic-data={
          !sectionsVisibility.address && !sectionsVisibility.identity
        }
      >
        <DataContainer
          headerIcon={IcoFileText224}
          sx={{ gridArea: '1 / 1 / span 1 / span 1' }}
          title={t('user-info.basic.title')}
        >
          {user.identityDataAttributes.includes(UserDataAttribute.firstName) &&
            user.identityDataAttributes.includes(
              UserDataAttribute.lastName,
            ) && (
              <Checkbox
                {...register(UserDataAttributeFullName)}
                disabled={isCheckboxDisabled(user.attributes.firstName.value)}
                label={allT('collected-data-options.name')}
              />
            )}
          {user.identityDataAttributes.includes(UserDataAttribute.email) && (
            <Checkbox
              {...register(UserDataAttribute.email)}
              disabled={isCheckboxDisabled(user.attributes.email.value)}
              label={allT('collected-data-options.email')}
            />
          )}
          {user.identityDataAttributes.includes(
            UserDataAttribute.phoneNumber,
          ) && (
            <Checkbox
              {...register(UserDataAttribute.phoneNumber)}
              disabled={isCheckboxDisabled(user.attributes.phoneNumber.value)}
              label={allT('collected-data-options.phone_number')}
            />
          )}
        </DataContainer>
        {sectionsVisibility.identity && (
          <DataContainer
            headerIcon={IcoUserCircle24}
            sx={{
              gridArea: '1 / 2 / span 1 / span 1',
            }}
            title={t('user-info.identity.title')}
          >
            {user.identityDataAttributes.includes(UserDataAttribute.ssn9) && (
              <Checkbox
                {...register(UserDataAttribute.ssn9)}
                disabled={isCheckboxDisabled(user.attributes.ssn9.value)}
                label={allT('collected-data-options.ssn9')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.ssn4) && (
              <Checkbox
                {...register(UserDataAttribute.ssn4)}
                disabled={isCheckboxDisabled(user.attributes.ssn4.value)}
                label={allT('collected-data-options.ssn4')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.dob) && (
              <Checkbox
                {...register(UserDataAttribute.dob)}
                disabled={isCheckboxDisabled(user.attributes.dob.value)}
                label={allT('collected-data-options.dob')}
              />
            )}
          </DataContainer>
        )}
        {sectionsVisibility.address && (
          <DataContainer
            sx={{
              gridArea: sectionsVisibility.identity
                ? '2 / 1 / span 1 / span 1'
                : '1 / 2 / span 1 / span 1',
            }}
            headerIcon={IcoBuilding24}
            title={t('user-info.address.title')}
          >
            {user.identityDataAttributes.includes(
              UserDataAttribute.country,
            ) && (
              <Checkbox
                {...register(UserDataAttribute.country)}
                disabled={isCheckboxDisabled(user.attributes.country.value)}
                label={allT('user-data-attributes.country')}
              />
            )}
            {user.identityDataAttributes.includes(
              UserDataAttribute.addressLine1,
            ) && (
              <Checkbox
                {...register(UserDataAttribute.addressLine1)}
                disabled={isCheckboxDisabled(
                  user.attributes.addressLine1.value,
                )}
                label={allT('user-data-attributes.address-line1')}
              />
            )}
            {user.identityDataAttributes.includes(
              UserDataAttribute.addressLine2,
            ) && (
              <Checkbox
                {...register(UserDataAttribute.addressLine2)}
                disabled={isCheckboxDisabled(
                  user.attributes.addressLine2.value,
                )}
                label={allT('user-data-attributes.address-line2')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.city) && (
              <Checkbox
                {...register(UserDataAttribute.city)}
                disabled={isCheckboxDisabled(user.attributes.city.value)}
                label={allT('user-data-attributes.city')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.zip) && (
              <Checkbox
                {...register(UserDataAttribute.zip)}
                disabled={isCheckboxDisabled(user.attributes.zip.value)}
                label={allT('user-data-attributes.zip')}
              />
            )}
            {user.identityDataAttributes.includes(UserDataAttribute.state) && (
              <Checkbox
                {...register(UserDataAttribute.state)}
                disabled={isCheckboxDisabled(user.attributes.state.value)}
                label={allT('user-data-attributes.state')}
              />
            )}
          </DataContainer>
        )}
      </DataGrid>
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
