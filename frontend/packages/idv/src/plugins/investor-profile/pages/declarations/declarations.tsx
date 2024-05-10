import { getErrorMessage } from '@onefootprint/request';
import { DocumentDI, InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import useUploadFile from '../../../../hooks/api/hosted/user/use-upload-file';
import Logger from '../../../../utils/logger';
import InvestorProfileNavigationHeader from '../../components/investor-profile-navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { DeclarationData } from '../../utils/state-machine/types';
import DeclarationsForm from './components/declarations-form';

const Declarations = () => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data } = state.context;
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const uploadFileMutation = useUploadFile();

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

        if (uploadFileMutation.isLoading) {
          return;
        }

        uploadFileMutation.mutate(
          {
            file: files[0],
            documentKind: DocumentDI.finraComplianceLetter,
            authToken: authToken ?? '',
          },
          {
            onSuccess: () => {
              sendDeclarationData(declarationData);
            },
            onError: (error: unknown) => {
              const fileType = files[0].type;
              Logger.error(
                `Encountered error while uploading declarations files of type ${fileType}: ${getErrorMessage(
                  error,
                )}`,
                'investor-profile-declarations',
              );
            },
          },
        );
      },
      onError: (error: string) => {
        Logger.error(
          `Encountered error while vaulting data on investor profile declarations page: ${error}`,
          'investor-profile-declarations',
        );
      },
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
      onError: (error: unknown) => {
        Logger.error(
          `Encountered error while speculatively saving data on investor profile declarations page: ${error}`,
          'investor-profile-declarations',
        );
      },
    });
  };

  return (
    <>
      <InvestorProfileNavigationHeader />
      <DeclarationsForm
        isLoading={syncDataMutation.isLoading || uploadFileMutation.isLoading}
        onSubmit={handleSubmit}
        defaultValues={{
          [InvestorProfileDI.declarations]:
            data?.[InvestorProfileDI.declarations],
          [InvestorProfileDI.brokerageFirmEmployer]:
            data?.[InvestorProfileDI.brokerageFirmEmployer],
          [InvestorProfileDI.seniorExecutiveSymbols]:
            data?.[InvestorProfileDI.seniorExecutiveSymbols],
          [InvestorProfileDI.familyMemberNames]:
            data?.[InvestorProfileDI.familyMemberNames],
          [InvestorProfileDI.politicalOrganization]:
            data?.[InvestorProfileDI.politicalOrganization],
        }}
      />
    </>
  );
};

export default Declarations;
