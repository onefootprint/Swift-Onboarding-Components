import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import useCollectKycDataMachine, {
  Events,
} from '../../hooks/use-collect-kyc-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { SSNInformation } from '../../utils/data-types';
import SSN4 from './components/ssn4';
import SSN9 from './components/ssn9';

type SSNProps = {
  onComplete?: () => void;
  ctaLabel?: string;
  hideDisclaimer?: boolean;
  hideHeader?: boolean;
};

const SSN = ({
  hideDisclaimer,
  ctaLabel,
  hideHeader,
  onComplete,
}: SSNProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.ssn');

  const onSubmit = (ssnInfo: SSNInformation) => {
    const handleSuccess = () => {
      send({
        type: Events.ssnSubmitted,
        payload: ssnInfo,
      });
      onComplete?.();
    };

    const handleError = () => {
      toast.show({
        title: t('sync-data-error.title'),
        description: t('sync-data-error.description'),
        variant: 'error',
      });
    };

    if (!authToken) {
      return;
    }
    syncData({
      authToken,
      data: ssnInfo,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  if (missingAttributes.includes(CollectedKycDataOption.ssn4)) {
    return (
      <SSN4
        onSubmit={onSubmit}
        isMutationLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        hideHeader={hideHeader}
      />
    );
  }

  if (missingAttributes.includes(CollectedKycDataOption.ssn9)) {
    return (
      <SSN9
        onSubmit={onSubmit}
        isMutationLoading={mutation.isLoading}
        hideDisclaimer={hideDisclaimer}
        ctaLabel={ctaLabel}
        hideHeader={hideHeader}
      />
    );
  }
  return <div />;
};

export default SSN;
