import { InvestorProfileDI } from '@onefootprint/types';
import type React from 'react';

import { getLogger } from '../../../../utils/logger';
import ContinueButton from '../../components/form-with-error-footer/components/continue-button';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { DeclarationData } from '../../utils/state-machine/types';
import DeclarationsForm from './components/declarations-form';

type DeclarationsProps = {
  onSuccess?: () => void;
  renderFooter?: (isLoading: boolean) => React.ReactNode;
};

const { logError } = getLogger({ location: 'investor-profile-declarations' });

const Declarations = ({ onSuccess, renderFooter }: DeclarationsProps) => {
  const [state, send] = useInvestorProfileMachine();
  const { authToken, data, declarationFiles } = state.context;
  const { mutation: syncDataMutation, syncData } = useSyncData();
  const isLoading = syncDataMutation.isLoading;

  const handleSubmit = (declarationData: DeclarationData, files?: File[]) => {
    syncData({
      authToken,
      data: declarationData,
      speculative: true, // First send the declarations data speculatively to check for any errors
      onSuccess: () => {
        send({
          type: 'declarationsSubmitted',
          payload: { data: declarationData, files },
        });
        onSuccess?.();
      },
      onError: (error: unknown) => {
        logError(
          `Encountered error while speculatively saving data on investor profile declarations page: ${error}`,
          error,
        );
      },
    });
  };

  return (
    <DeclarationsForm
      onSubmit={handleSubmit}
      selectedFiles={declarationFiles}
      defaultValues={{
        [InvestorProfileDI.declarations]: data?.[InvestorProfileDI.declarations],
        [InvestorProfileDI.brokerageFirmEmployer]: data?.[InvestorProfileDI.brokerageFirmEmployer],
        [InvestorProfileDI.seniorExecutiveSymbols]: data?.[InvestorProfileDI.seniorExecutiveSymbols],
        [InvestorProfileDI.familyMemberNames]: data?.[InvestorProfileDI.familyMemberNames],
        [InvestorProfileDI.politicalOrganization]: data?.[InvestorProfileDI.politicalOrganization],
      }}
      footer={
        renderFooter ? (
          renderFooter(isLoading)
        ) : (
          <ContinueButton isLoading={isLoading} trackActionName="investor-profile:declarations-continue" />
        )
      }
    />
  );
};

export default Declarations;
