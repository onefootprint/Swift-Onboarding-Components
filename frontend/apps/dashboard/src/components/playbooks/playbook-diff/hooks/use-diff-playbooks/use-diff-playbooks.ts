import { putOrgPlaybooksByPlaybookIdMutation } from '@onefootprint/axios/dashboard';
import type {
  CreateOnboardingConfigurationRequest,
  OnboardingConfiguration,
} from '@onefootprint/request-types/dashboard';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import createDiff from './utils/create-diff';

const useDiffPlaybooks = ({
  oldPlaybook,
  newPlaybookPayload,
}: {
  oldPlaybook: OnboardingConfiguration;
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
          playbookId: oldPlaybook.playbookId,
        },
        body: {
          expectedLatestObcId: oldPlaybook.id,
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
    data: mutation.data && createDiff(oldPlaybook, mutation.data),
  };
};

export default useDiffPlaybooks;
