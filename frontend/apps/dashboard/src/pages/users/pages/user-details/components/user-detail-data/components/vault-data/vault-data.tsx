import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { UserDataAttribute } from '@onefootprint/types';
import { Portal, useToast } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { USER_HEADER_ACTIONS_SELECTOR } from 'src/pages/users/pages/user-details/constants';
import useDecryptUser from 'src/pages/users/pages/user-details/hooks/use-descrypt-user';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';
import getAttrListFromFields from 'src/utils/get-attr-list-from-fields';
import { useUpdateEffect } from 'usehooks-ts';

import { Event, Fields, State } from '../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../decrypt-machine-provider';
import Content from './components/content';
import DecryptControls from './components/decrypt-controls';
import type { FormData } from './vault-data.types';

const VaultData = () => {
  const { t } = useTranslation('pages.user-details');
  const toast = useToast();

  const [state, send] = useDecryptMachine();
  const { fields, reason } = state.context;
  const isDecrypting =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);

  const formMethods = useForm<FormData>({
    defaultValues: state.context.fields || {
      kycData: {},
      idDoc: {},
    },
  });
  const { handleSubmit, reset } = formMethods;

  const userId = useUserId();
  const userQuery = useUser(userId);
  const decryptUser = useDecryptUser();
  const userVaultDataQuery = useUserVault(userId, userQuery.data);
  const vaultData = userVaultDataQuery.data;
  const isLoading = userVaultDataQuery.isLoading || userQuery.isLoading;
  const hasData = !!vaultData && !!userQuery.data;
  const shouldShow = !isLoading && !!hasData;

  useUpdateEffect(() => {
    if (state.matches(State.idle)) {
      // Don't persist form state if the user canceled decryption
      reset();
    }

    if (state.matches(State.decrypting) && reason && fields) {
      // Get the attribute names with true values
      const { kycData, idDoc } = getAttrListFromFields(
        fields.kycData,
        fields.idDoc,
      );
      decryptUser(
        { kycData, idDoc, reason },
        {
          onSuccess: () => {
            send({ type: Event.decryptSucceeded });
          },
          onError: (error: unknown) => {
            send({ type: Event.decryptFailed });
            toast.show({
              description: getErrorMessage(error),
              title: 'Uh-oh!',
              variant: 'error',
            });
          },
        },
      );
    }
  }, [state.value]);

  const showMinSelectionError = () => {
    toast.show({
      description: t('decrypt.errors.min-selected.description'),
      title: t('decrypt.errors.min-selected.title'),
      variant: 'error',
    });
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const { kycData, idDoc } = formData;
    const attrLists = getAttrListFromFields(kycData, idDoc);

    if (attrLists.kycData.length === 0 && attrLists.idDoc.length === 0) {
      showMinSelectionError();
      return;
    }
    const { idDoc: vaultIdDocData, kycData: vaultKycData } = vaultData ?? {};
    const allKycDecrypted = attrLists.kycData.every(
      attr => typeof vaultKycData?.[attr] === 'string',
    );
    const allIdDocDecrypted =
      !vaultIdDocData ||
      attrLists.idDoc.every(attr => typeof vaultIdDocData[attr] === 'string');
    if (allKycDecrypted && allIdDocDecrypted) {
      showMinSelectionError();
      return;
    }

    const fieldsToSend: Fields = {
      kycData: {
        ...kycData,
        // Decrypt both first & last names together
        [UserDataAttribute.lastName]: !!kycData[UserDataAttribute.firstName],
      },
      idDoc,
    };
    send({ type: Event.submittedFields, payload: { fields: fieldsToSend } });
  };

  return shouldShow ? (
    <>
      <Portal selector={USER_HEADER_ACTIONS_SELECTOR}>
        <DecryptControls />
      </Portal>
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="decrypt-form">
        <FormProvider {...formMethods}>
          <Content
            user={userQuery.data}
            vaultData={vaultData}
            isDecrypting={isDecrypting}
          />
        </FormProvider>
      </form>
    </>
  ) : null;
};

export default VaultData;
