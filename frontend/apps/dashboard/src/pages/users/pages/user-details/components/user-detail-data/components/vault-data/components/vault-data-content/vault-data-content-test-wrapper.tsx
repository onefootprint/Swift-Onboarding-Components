import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import VaultDataContent, { FormData, VaultDataContentProps } from '.';

export type VaultDataTestWrapperProps = VaultDataContentProps & {
  onSubmit: (data: FormData) => void;
};

const VaultDataContentTestWrapper = ({
  user,
  vaultData,
  isDecrypting,
  onSubmit,
}: VaultDataTestWrapperProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      kycData: {},
      idDoc: {},
    },
  });
  const { handleSubmit } = formMethods;

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="decrypt-form">
      <FormProvider {...formMethods}>
        <VaultDataContent
          user={user}
          vaultData={vaultData}
          isDecrypting={isDecrypting}
        />
      </FormProvider>
    </form>
  );
};

export default VaultDataContentTestWrapper;
