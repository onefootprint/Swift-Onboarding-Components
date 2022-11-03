import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Box, useToast } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { User } from 'src/pages/users/types/user.types';
import { IdDocDataAttribute } from 'src/pages/users/types/vault-data.types';
import getAttrListFromFields from 'src/utils/get-attr-list-from-fields';
import styled, { css } from 'styled-components';

import { Event, Fields } from '../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../decrypt-machine-provider';
import getSectionsVisibility from '../../utils/get-sections-visibility';
import AddressSection from './components/address-section';
import BasicSection from './components/basic-section';
import IdentitySection from './components/identity-section';

type DecryptVaultDataProps = {
  user: User;
};

type FormKycAttributes = Exclude<UserDataAttribute, UserDataAttribute.lastName>;
type FormData = {
  kycData: Record<FormKycAttributes, boolean>;
  idDoc: Partial<Record<IdDocDataAttribute, boolean>>;
};

const DecryptVaultData = ({ user }: DecryptVaultDataProps) => {
  const { t } = useTranslation('pages.user-details');
  const [state, send] = useDecryptMachine();
  const formMethods = useForm<FormData>({
    defaultValues: state.context.fields || {
      kycData: {},
      idDoc: {},
    },
  });
  const { handleSubmit } = formMethods;
  const toast = useToast();
  const sectionsVisibility = getSectionsVisibility(user.identityDataAttributes);
  const showIdentity = sectionsVisibility.identity;
  const showAddress = sectionsVisibility.address;

  const handleBeforeSubmit = (formData: FormData) => {
    const { kycData, idDoc } = formData;
    const attrLists = getAttrListFromFields(kycData, idDoc);
    const hasSelectedFields =
      attrLists.kycData.length > 0 || attrLists.idDoc.length > 0;
    if (!hasSelectedFields) {
      toast.show({
        description: t('decrypt.errors.min-selected.description'),
        title: t('decrypt.errors.min-selected.title'),
        variant: 'error',
      });
      return;
    }

    const fields: Fields = {
      kycData: {
        ...kycData,
        // Decrypt both first & last names together
        [UserDataAttribute.lastName]: !!kycData[UserDataAttribute.firstName],
      },
      idDoc: { ...idDoc },
    };
    send({ type: Event.submittedFields, payload: { fields } });
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
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(2, 1fr);
  `};
`;

export default DecryptVaultData;
