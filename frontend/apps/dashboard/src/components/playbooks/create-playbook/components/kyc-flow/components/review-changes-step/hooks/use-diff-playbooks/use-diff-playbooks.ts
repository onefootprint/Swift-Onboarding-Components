import { putOrgPlaybooksByPlaybookIdMutation } from '@onefootprint/axios/dashboard';
import type {
  CreateOnboardingConfigurationRequest,
  OnboardingConfiguration,
} from '@onefootprint/request-types/dashboard';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import createDiff from './utils/create-diff';

const useDiffPlaybooks = ({
  currentPlaybook,
  newPlaybookPayload,
}: {
  currentPlaybook: OnboardingConfiguration;
  newPlaybookPayload: CreateOnboardingConfigurationRequest;
}) => {
  const mutation = useMutation(
    putOrgPlaybooksByPlaybookIdMutation({
      headers: { 'X-Fp-Dry-Run': true },
    }),
  );

  const validateChanges = async () => {
    try {
      await mutation.mutateAsync({
        path: {
          playbookId: currentPlaybook.playbookId,
        },
        body: {
          expectedLatestObcId: currentPlaybook.id,
          newOnboardingConfig: newPlaybookPayload,
        },
      });
    } catch (error) {
      // TODO: handle error
      console.log(error);
    }
  };

  useEffect(() => {
    validateChanges();
  }, []);

  return {
    ...mutation,
    data: mutation.data && createDiff(currentPlaybook, mutation.data),
  };
};

export default useDiffPlaybooks;
