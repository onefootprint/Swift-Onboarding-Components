import { Portal } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { USER_HEADER_ACTIONS_SELECTOR } from 'src/pages/users/pages/user-details/constants';
import useUser from 'src/pages/users/pages/user-details/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';

import Content from './components/content';
import Decrypt, {
  DecryptMachineProvider,
  FormData,
  useDecryptControls,
} from './components/decrypt';

const initialFormValues = {
  id: {},
  investor_profile: {},
  id_document: {},
};

const VaultData = () => {
  const userId = useUserId();
  const decrypt = useDecryptControls();
  const formMethods = useForm<FormData>({
    defaultValues: decrypt.context.fields || initialFormValues,
  });
  const { handleSubmit } = formMethods;
  const userQuery = useUser(userId);
  const userVaultDataQuery = useUserVault(userId, userQuery.data);
  const vaultData = userVaultDataQuery.data;
  const isLoading = userVaultDataQuery.isLoading || userQuery.isLoading;
  const hasData = !!vaultData && !!userQuery.data;
  const shouldShow = !isLoading && !!hasData;

  const handleBeforeSubmit = (formData: FormData) => {
    decrypt.submitFields(formData);
  };

  return shouldShow ? (
    <>
      <Portal selector={USER_HEADER_ACTIONS_SELECTOR}>
        <Decrypt />
      </Portal>
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="decrypt-form">
        <FormProvider {...formMethods}>
          <Content
            user={userQuery.data}
            vault={vaultData}
            isDecrypting={decrypt.inProgress}
          />
        </FormProvider>
      </form>
    </>
  ) : null;
};

const VaultDataWithMachineProvider = () => (
  <DecryptMachineProvider>
    <VaultData />
  </DecryptMachineProvider>
);

export default VaultDataWithMachineProvider;
