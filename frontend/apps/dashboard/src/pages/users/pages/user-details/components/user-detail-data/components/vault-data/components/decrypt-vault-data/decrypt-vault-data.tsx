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
import IdDocSection from './components/id-doc-section';
import IdentitySection from './components/identity-section';

type DecryptVaultDataProps = {
  user: User;
};

// Only add first name in the form as a checkbox, combine first & last to show when decrypted
type FormKycAttributes = Exclude<UserDataAttribute, UserDataAttribute.lastName>;
// Only add frontImage in the form as a checkbox, show both front & back (if available) when decrypted
type FormIdDocAttributes = Exclude<
  IdDocDataAttribute,
  IdDocDataAttribute.backImage
>;

type FormData = {
  kycData: Partial<Record<FormKycAttributes, boolean>>;
  idDoc: Partial<Record<FormIdDocAttributes, boolean>>;
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
  const sectionsVisibility = getSectionsVisibility(user.vaultData);
  const { identitySection, addressSection, idDocSection } = sectionsVisibility;

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
      idDoc: {
        ...idDoc,
        // Decrypt both front & back images together
        [IdDocDataAttribute.backImage]: !!idDoc[IdDocDataAttribute.frontImage],
      },
    };
    send({ type: Event.submittedFields, payload: { fields } });
  };

  return (
    <form onSubmit={handleSubmit(handleBeforeSubmit)} id="decrypt-form">
      <FormProvider {...formMethods}>
        <Container>
          <DataGrid>
            <BasicSection user={user} />
            {identitySection && <IdentitySection user={user} />}
            {addressSection && (
              <Box
                sx={{
                  gridRow: identitySection ? '1 / span 2' : undefined,
                  gridColumn: '2 / 2',
                }}
              >
                <AddressSection user={user} />
              </Box>
            )}
          </DataGrid>
          {idDocSection && <IdDocSection user={user} />}
        </Container>
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

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
  `};
`;

export default DecryptVaultData;
