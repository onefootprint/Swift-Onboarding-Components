import { useTranslation } from '@onefootprint/hooks';
import { DocumentsDI, InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import { HeaderTitle } from '../../../../components';
import useUploadFile from '../../../../hooks/api/hosted/user/use-upload-file';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import useSyncErrorToast from '../../hooks/use-sync-error-toast';
import { DeclarationData } from '../../utils/state-machine/types';
import DeclarationsForm from './components/declarations-form';

const Declarations = () => {
  const { t } = useTranslation('pages.declarations');
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const uploadFileMutation = useUploadFile();
  const showToast = useSyncErrorToast();

  const sendDeclarationData = (declarationData: DeclarationData) => {
    send({
      type: 'declarationsSubmitted',
      payload: {
        ...declarationData,
      },
    });
  };

  const commitData = (declarationData: DeclarationData, files?: File[]) => {
    syncData({
      authToken,
      data: {
        ...data,
        ...declarationData,
      },
      onSuccess: async () => {
        // Next, submit any docs data to backend
        if (!files?.length) {
          sendDeclarationData(declarationData);
          return;
        }

        uploadFileMutation.mutate(
          {
            file: files[0],
            documentKind: DocumentsDI.finraComplianceLetter,
            authToken: authToken ?? '',
          },
          {
            onSuccess: () => {
              sendDeclarationData(declarationData);
            },
            onError: showToast,
          },
        );
      },
      onError: showToast,
    });
  };

  const handleSubmit = (declarationData: DeclarationData, files?: File[]) => {
    // First send the declarations data speculatively to check for any errors
    syncData({
      authToken,
      data: declarationData,
      speculative: true,
      onSuccess: () => {
        // Since this is the last data collection step, go ahead and submit all of this data to backend non-speculatively
        commitData(declarationData, files);
      },
      onError: showToast,
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <HeaderTitle
        title={t('title')}
        subtitle={t('subtitle')}
        sx={{ marginBottom: 7 }}
      />
      <DeclarationsForm
        isLoading={syncDataMutation.isLoading || uploadFileMutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.declarations]:
            data?.[InvestorProfileDI.declarations],
        }}
      />
    </>
  );
};

export default Declarations;
